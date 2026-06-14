import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryLedgerDto } from './dto/query-ledger.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, query: QueryLedgerDto) {
    const { page = 1, limit = 20, storeId, clientId, type, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.LedgerEntryWhereInput = { tenantId };

    if (storeId) where.storeId = storeId;
    if (clientId) where.clientId = clientId;
    if (type) where.type = type as any;
    if (dateFrom || dateTo) {
      where.occurredAt = {};
      if (dateFrom) where.occurredAt.gte = new Date(dateFrom);
      if (dateTo) where.occurredAt.lte = new Date(dateTo);
    }

    const [data, total, aggregates] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
        include: {
          client: { select: { id: true, nickname: true } },
          order: { select: { id: true, orderNo: true } },
          booking: { select: { id: true, bookingNo: true } },
        },
      }),
      this.prisma.ledgerEntry.count({ where }),
      this.prisma.ledgerEntry.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalAmount: aggregates._sum.amount,
    };
  }

  async findOne(id: number, tenantId: number) {
    const entry = await this.prisma.ledgerEntry.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, nickname: true, phone: true } },
        order: { select: { id: true, orderNo: true, status: true } },
        payment: { select: { id: true, transactionId: true, channel: true } },
        booking: { select: { id: true, bookingNo: true, status: true } },
      },
    });
    if (!entry) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Ledger entry ${id} not found`);
    }
    return entry;
  }
}
