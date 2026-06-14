import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponTemplateDto } from './dto/create-coupon-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  // ---- Coupon Templates ----

  async createTemplate(dto: CreateCouponTemplateDto, tenantId: number) {
    return this.prisma.couponTemplate.create({
      data: {
        ...dto,
        discountValue: dto.discountValue,
        minimumSpend: dto.minimumSpend,
        tenantId,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
      },
    });
  }

  async findAllTemplates(tenantId: number, query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.CouponTemplateWhereInput = { tenantId };
    if (status) where.status = status as any;

    const [data, total] = await Promise.all([
      this.prisma.couponTemplate.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.couponTemplate.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneTemplate(id: number, tenantId: number) {
    const t = await this.prisma.couponTemplate.findFirst({ where: { id, tenantId } });
    if (!t) throw new NotFoundException(`Coupon template ${id} not found`);
    return t;
  }

  async updateTemplate(id: number, dto: Partial<CreateCouponTemplateDto>, tenantId: number) {
    await this.findOneTemplate(id, tenantId);
    return this.prisma.couponTemplate.update({ where: { id }, data: dto as any });
  }

  async removeTemplate(id: number, tenantId: number) {
    await this.findOneTemplate(id, tenantId);
    return this.prisma.couponTemplate.update({ where: { id }, data: { status: 'INACTIVE' as any } });
  }

  // ---- Client Coupons ----

  async issueCoupon(templateId: number, clientId: number, tenantId: number) {
    const template = await this.findOneTemplate(templateId, tenantId);
    const count = await this.prisma.clientCoupon.count({
      where: { couponTemplateId: templateId, clientId, tenantId },
    });
    if (template.perUserLimit && count >= template.perUserLimit) {
      const { BadRequestException } = await import('@nestjs/common');
      throw new BadRequestException('Coupon usage limit reached for this user');
    }
    return this.prisma.clientCoupon.create({
      data: {
        tenantId,
        clientId,
        couponTemplateId: templateId,
        expiredAt: template.validTo,
      },
    });
  }

  async findClientCoupons(tenantId: number, clientId: number) {
    return this.prisma.clientCoupon.findMany({
      where: { tenantId, clientId },
      include: { couponTemplate: true },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
