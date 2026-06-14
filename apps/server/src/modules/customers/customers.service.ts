import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, tenantId: number) {
    if (dto.phone) {
      const existing = await this.prisma.client.findFirst({
        where: { tenantId, phone: dto.phone },
      });
      if (existing) {
        throw new ConflictException('Phone number already exists');
      }
    }
    return this.prisma.client.create({
      data: {
        tenantId,
        openid: dto.openid,
        phone: dto.phone,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  async findAll(tenantId: number, query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.ClientWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { bookings: true, memberships: true } },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { bookings: true, memberships: true, orders: true } },
      },
    });
    if (!client) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return client;
  }

  async update(id: number, dto: UpdateCustomerDto, tenantId: number) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.tags) {
      try {
        data.tags = JSON.parse(dto.tags);
      } catch {
        data.tags = dto.tags;
      }
    }
    return this.prisma.client.update({ where: { id }, data });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.client.update({
      where: { id },
      data: { status: 'DISABLED' as any },
    });
  }
}
