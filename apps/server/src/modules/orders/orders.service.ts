import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { generateOrderNo } from './order-number.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, tenantId: number) {
    return this.prisma.order.create({
      data: {
        tenantId,
        storeId: dto.storeId ?? 0,
        clientId: dto.clientId,
        bookingId: dto.bookingId,
        orderNo: generateOrderNo(),
        status: 'PENDING',
        orderType: dto.orderType,
        originalAmount: dto.amount,
        discountAmount: 0,
        paidAmount: 0,
      },
    });
  }

  async findAll(
    tenantId: number,
    query: { clientId?: number; status?: string; page?: number; limit?: number },
  ) {
    const { clientId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = { tenantId };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status as any;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, nickname: true, phone: true } },
          payments: { select: { id: true, status: true, amount: true, channel: true } },
          booking: {
            select: {
              id: true,
              bookingNo: true,
              service: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number, clientId?: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        tenantId,
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: { select: { id: true, nickname: true, phone: true } },
        payments: true,
        booking: {
          select: { id: true, bookingNo: true, status: true },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async refund(id: number, tenantId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: { booking: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (order.status !== 'PAID') {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });

      if (order.bookingId && order.booking) {
        if (order.booking.usedMembershipId) {
          const membership = await tx.membership.findUnique({
            where: { id: order.booking.usedMembershipId },
          });
          if (membership?.type === 'STORED_VALUE') {
            await tx.membership.update({
              where: { id: membership.id },
              data: { balanceAmount: { increment: Number(order.paidAmount) } },
            });
          } else if (membership?.type !== 'DURATION_BASED') {
            await tx.membership.update({
              where: { id: membership!.id },
              data: { remainingTimes: { increment: 1 } },
            });
          }
        }

        if (!['COMPLETED', 'CANCELED'].includes(order.booking.status)) {
          await tx.booking.update({
            where: { id: order.bookingId },
            data: { status: 'CANCELED', canceledAt: new Date(), cancelReason: 'Order refunded' },
          });
          await tx.schedule.update({
            where: { id: order.booking.scheduleId },
            data: { bookedCount: { decrement: 1 } },
          });
        }
      }

      await tx.ledgerEntry.create({
        data: {
          tenantId,
          storeId: order.storeId,
          clientId: order.clientId,
          orderId: order.id,
          bookingId: order.bookingId ?? undefined,
          type: 'REFUND',
          amount: Number(order.paidAmount) * -1,
          occurredAt: new Date(),
          source: 'REFUND',
          remark: `Refund order ${order.orderNo}`,
        },
      });

      return { success: true, orderId: id };
    });
  }
}
