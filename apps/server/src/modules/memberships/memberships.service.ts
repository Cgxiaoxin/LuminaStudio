import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { ConsumeSessionDto } from './dto/consume-session.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMembershipDto, tenantId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, tenantId },
    });
    if (!client) {
      throw new NotFoundException(`Client ${dto.clientId} not found`);
    }

    const data: Prisma.MembershipCreateInput = {
      tenant: { connect: { id: tenantId } },
      client: { connect: { id: dto.clientId } },
      name: dto.name,
      type: dto.type as any,
      status: 'ACTIVE' as any,
      totalTimes: dto.totalTimes,
      remainingTimes: dto.type === 'DURATION_BASED' ? undefined : dto.totalTimes,
      balanceAmount: dto.balanceAmount ?? (dto.type === 'STORED_VALUE' ? 0 : 0),
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : undefined,
      store: dto.storeId ? { connect: { id: dto.storeId } } : undefined,
    };

    return this.prisma.membership.create({ data });
  }

  async findAll(tenantId: number, query: { clientId?: number; status?: string; page?: number; limit?: number }) {
    const { clientId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.MembershipWhereInput = { tenantId };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status as any;

    const [data, total] = await Promise.all([
      this.prisma.membership.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, nickname: true, phone: true } },
          _count: { select: { bookings: true } },
        },
      }),
      this.prisma.membership.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number, clientId?: number) {
    const membership = await this.prisma.membership.findFirst({
      where: { id, tenantId, ...(clientId ? { clientId } : {}) },
      include: {
        client: { select: { id: true, nickname: true, phone: true, avatarUrl: true } },
      },
    });
    if (!membership) {
      throw new NotFoundException(`Membership ${id} not found`);
    }
    return membership;
  }

  async findUsage(id: number, tenantId: number, page = 1, limit = 20) {
    await this.findOne(id, tenantId);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { usedMembershipId: id, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { id: true, name: true, type: true } },
          schedule: { select: { startAt: true, endAt: true } },
        },
      }),
      this.prisma.booking.count({ where: { usedMembershipId: id, tenantId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async consume(id: number, tenantId: number, dto: ConsumeSessionDto) {
    const membership = await this.findOne(id, tenantId);

    if (membership.status !== 'ACTIVE') {
      throw new BadRequestException('Membership is not active');
    }

    if (membership.type === 'DURATION_BASED') {
      if (membership.expiredAt && new Date() > membership.expiredAt) {
        await this.autoExpire(id);
        throw new BadRequestException('Membership has expired');
      }
      return membership;
    }

    if (membership.type === 'STORED_VALUE') {
      const balance = Number(membership.balanceAmount ?? 0);
      const cost = dto.amount ?? dto.count;
      if (balance < cost) {
        throw new BadRequestException(`Insufficient balance: ¥${balance}, ¥${cost} required`);
      }
      return this.prisma.membership.update({
        where: { id },
        data: { balanceAmount: { decrement: cost } },
      });
    }

    const remaining = membership.remainingTimes ?? 0;
    if (remaining < dto.count) {
      throw new BadRequestException(
        `Insufficient sessions: ${remaining} remaining, ${dto.count} required`,
      );
    }

    return this.prisma.membership.update({
      where: { id },
      data: { remainingTimes: { decrement: dto.count } },
    });
  }

  async cancel(id: number, tenantId: number) {
    const membership = await this.findOne(id, tenantId);
    if (membership.status !== 'ACTIVE') {
      throw new BadRequestException('Membership is not active');
    }
    return this.prisma.membership.update({
      where: { id },
      data: { status: 'CANCELED' as any },
    });
  }

  private async autoExpire(id: number) {
    await this.prisma.membership.update({
      where: { id },
      data: { status: 'EXPIRED' as any },
    });
  }
}
