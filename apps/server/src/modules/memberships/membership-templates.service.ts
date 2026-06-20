import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMembershipTemplateDto } from './dto/create-membership-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembershipTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMembershipTemplateDto, tenantId: number) {
    return this.prisma.membershipTemplate.create({
      data: {
        tenantId,
        storeId: dto.storeId,
        name: dto.name,
        type: dto.type as any,
        description: dto.description,
        price: dto.price ?? 0,
        totalTimes: dto.totalTimes,
        validDays: dto.validDays,
        balanceAmount: dto.balanceAmount ?? 0,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(tenantId: number, query: { type?: string; status?: string; page?: number; limit?: number }) {
    const { type, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.MembershipTemplateWhereInput = { tenantId };
    if (type) where.type = type as any;
    if (status) where.status = status as any;

    const [data, total] = await Promise.all([
      this.prisma.membershipTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.membershipTemplate.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: number) {
    const template = await this.prisma.membershipTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException(`Membership template ${id} not found`);
    }
    return template;
  }

  async update(id: number, dto: Partial<CreateMembershipTemplateDto>, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.membershipTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as any,
        description: dto.description,
        price: dto.price,
        totalTimes: dto.totalTimes,
        validDays: dto.validDays,
        balanceAmount: dto.balanceAmount,
        storeId: dto.storeId,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.membershipTemplate.update({
      where: { id },
      data: { status: 'INACTIVE' as any },
    });
  }

  async issueFromTemplate(templateId: number, clientId: number, tenantId: number) {
    const template = await this.findOne(templateId, tenantId);
    const client = await this.prisma.client.findFirst({ where: { id: clientId, tenantId } });
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    const startedAt = new Date();
    const expiredAt = template.validDays
      ? new Date(startedAt.getTime() + template.validDays * 24 * 60 * 60 * 1000)
      : undefined;

    return this.prisma.membership.create({
      data: {
        tenantId,
        storeId: template.storeId,
        clientId,
        name: template.name,
        type: template.type,
        totalTimes: template.type === 'DURATION_BASED' ? undefined : template.totalTimes,
        remainingTimes: template.type === 'DURATION_BASED' ? undefined : template.totalTimes,
        balanceAmount: template.type === 'STORED_VALUE' ? template.balanceAmount : 0,
        startedAt,
        expiredAt,
        status: 'ACTIVE',
      },
    });
  }
}
