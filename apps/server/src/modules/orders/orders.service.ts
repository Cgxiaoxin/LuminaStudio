import { Injectable, NotFoundException } from '@nestjs/common';
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
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
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
}
