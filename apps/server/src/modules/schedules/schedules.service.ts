import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, tenantId: number) {
    return this.prisma.schedule.create({
      data: {
        tenantId,
        storeId: dto.storeId,
        serviceId: dto.serviceId,
        coachId: dto.coachId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        capacity: dto.capacity,
        bookedCount: 0,
        note: dto.note,
      },
      include: {
        service: { select: { id: true, name: true, type: true, price: true } },
        coach: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async findAll(tenantId: number, query: QueryScheduleDto) {
    const { page = 1, limit = 20, storeId, coachId, serviceId, dateFrom, dateTo, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ScheduleWhereInput = { tenantId };

    if (storeId) where.storeId = storeId;
    if (coachId) where.coachId = coachId;
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status as any;
    if (dateFrom || dateTo) {
      where.startAt = {};
      if (dateFrom) where.startAt.gte = new Date(dateFrom);
      if (dateTo) where.startAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startAt: 'asc' }],
        include: {
          service: { select: { id: true, name: true, type: true, price: true, durationMinutes: true } },
          coach: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, tenantId },
      include: {
        service: { select: { id: true, name: true, type: true, price: true, durationMinutes: true } },
        coach: { select: { id: true, displayName: true, avatarUrl: true, bio: true } },
      },
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto, tenantId: number) {
    const schedule = await this.findOne(id, tenantId);
    if (dto.capacity != null && dto.capacity < schedule.bookedCount) {
      throw new BadRequestException('Capacity cannot be lower than current booked count');
    }
    const data: any = { ...dto };
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);
    return this.prisma.schedule.update({
      where: { id },
      data,
      include: {
        service: { select: { id: true, name: true, type: true, price: true } },
        coach: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const schedule = await this.findOne(id, tenantId);
    if (schedule.bookedCount > 0) {
      throw new ConflictException('Cannot cancel schedule with existing bookings');
    }
    return this.prisma.schedule.update({
      where: { id },
      data: { status: 'CANCELED' },
    });
  }
}
