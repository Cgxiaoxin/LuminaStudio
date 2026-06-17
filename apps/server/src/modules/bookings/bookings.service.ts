import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { generateBookingNo } from './booking-number.util';
import { generateOrderNo } from '../orders/order-number.util';
import { Prisma } from '@prisma/client';

type CreateBookingInput = CreateBookingDto & { clientId: number };

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private membershipsService: MembershipsService,
  ) {}

  async create(dto: CreateBookingInput, tenantId: number, source: string = 'MANUAL') {
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: dto.scheduleId },
        include: { service: { select: { id: true, price: true, name: true } } },
      });

      if (!schedule || schedule.status === 'CANCELED') {
        throw new NotFoundException('Schedule not found or canceled');
      }
      if (schedule.tenantId !== tenantId) {
        throw new NotFoundException('Schedule not found');
      }

      // Atomic capacity check — prevents overselling under concurrent requests
      const updated = await tx.schedule.updateMany({
        where: {
          id: dto.scheduleId,
          bookedCount: { lt: schedule.capacity },
        },
        data: { bookedCount: { increment: 1 } },
      });

      if (updated.count === 0) {
        // Mark as FULL if at capacity
        await tx.schedule.update({
          where: { id: dto.scheduleId },
          data: { status: 'FULL' },
        });
        throw new BadRequestException('Schedule is full');
      }

      // Update status to FULL if now at capacity
      const newBookedCount = schedule.bookedCount + 1;
      if (newBookedCount >= schedule.capacity) {
        await tx.schedule.update({
          where: { id: dto.scheduleId },
          data: { status: 'FULL' },
        });
      }

      const needsPayment = Number(schedule.service.price) > 0;
      let status: string;
      let usedMembershipId: number | undefined;

      if (dto.membershipId) {
        // Use membership
        const membership = await tx.membership.findFirst({
          where: { id: dto.membershipId, tenantId, clientId: dto.clientId },
        });
        if (!membership) {
          throw new NotFoundException('Membership not found');
        }
        if (membership.status !== 'ACTIVE') {
          throw new BadRequestException('Membership is not active');
        }
        if (membership.type !== 'DURATION_BASED') {
          const remaining = membership.remainingTimes ?? 0;
          if (remaining < 1) {
            throw new BadRequestException('No remaining sessions on membership');
          }
          await tx.membership.update({
            where: { id: dto.membershipId },
            data: { remainingTimes: { decrement: 1 } },
          });
        }
        usedMembershipId = dto.membershipId;
        status = 'CONFIRMED';
      } else if (needsPayment) {
        status = 'PENDING_PAYMENT';
      } else {
        status = 'CONFIRMED';
      }

      const booking = await tx.booking.create({
        data: {
          tenantId,
          storeId: schedule.storeId,
          clientId: dto.clientId,
          serviceId: schedule.serviceId,
          scheduleId: dto.scheduleId,
          status: status as any,
          source: source as any,
          bookingNo: generateBookingNo(),
          paidAmount: 0,
          usedMembershipId,
        },
      });

      let order = null;
      if (status === 'PENDING_PAYMENT') {
        order = await tx.order.create({
          data: {
            tenantId,
            storeId: schedule.storeId,
            clientId: dto.clientId,
            bookingId: booking.id,
            serviceId: schedule.serviceId,
            orderNo: generateOrderNo(),
            status: 'PENDING',
            orderType: 'BOOKING',
            originalAmount: schedule.service.price,
            discountAmount: 0,
            paidAmount: 0,
          },
        });
      }

      return { booking, order };
    });
  }

  async findAll(
    tenantId: number,
    query: {
      clientId?: number;
      scheduleId?: number;
      status?: string;
      storeId?: number;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { page = 1, limit = 20, clientId, scheduleId, status, storeId, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = { tenantId };

    if (clientId) where.clientId = clientId;
    if (scheduleId) where.scheduleId = scheduleId;
    if (status) where.status = status as any;
    if (storeId) where.storeId = storeId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, nickname: true, phone: true, avatarUrl: true } },
          service: { select: { id: true, name: true, type: true } },
          schedule: { select: { startAt: true, endAt: true } },
          usedMembership: { select: { id: true, name: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, nickname: true, phone: true, avatarUrl: true } },
        service: { select: { id: true, name: true, type: true, price: true } },
        schedule: { select: { startAt: true, endAt: true, capacity: true } },
        usedMembership: { select: { id: true, name: true, type: true } },
      },
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }

  async checkIn(id: number, tenantId: number) {
    const booking = await this.findOne(id, tenantId);
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot check-in booking with status ${booking.status}`);
    }
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        checkinAt: new Date(),
      },
    });
  }

  async complete(id: number, tenantId: number) {
    const booking = await this.findOne(id, tenantId);
    if (booking.status !== 'CHECKED_IN') {
      throw new BadRequestException(`Cannot complete booking with status ${booking.status}`);
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  async cancel(id: number, tenantId: number, dto?: CancelBookingDto) {
    const booking = await this.findOne(id, tenantId);

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELED') {
      throw new BadRequestException(`Cannot cancel booking with status ${booking.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore membership session if one was used
      if (booking.usedMembershipId) {
        await tx.membership.update({
          where: { id: booking.usedMembershipId },
          data: { remainingTimes: { increment: 1 } },
        });
      }

      // Decrement schedule bookedCount
      await tx.schedule.update({
        where: { id: booking.scheduleId },
        data: { bookedCount: { decrement: 1 } },
      });

      // Restore schedule to OPEN if it was FULL
      const schedule = await tx.schedule.findUnique({ where: { id: booking.scheduleId } });
      if (schedule && schedule.status === 'FULL') {
        await tx.schedule.update({
          where: { id: booking.scheduleId },
          data: { status: 'OPEN' },
        });
      }

      return tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          cancelReason: dto?.reason,
        },
      });
    });
  }

  async confirmAfterPayment(id: number, tenantId: number) {
    const booking = await this.findOne(id, tenantId);
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Booking is not in PENDING_PAYMENT status`);
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }
}
