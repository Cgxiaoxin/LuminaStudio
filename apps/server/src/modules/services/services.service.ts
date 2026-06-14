import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto, tenantId: number) {
    const data: Prisma.ServiceCreateInput = {
      tenant: { connect: { id: tenantId } },
      name: dto.name,
      type: dto.type as any,
      price: dto.price,
      durationMinutes: dto.durationMinutes,
      description: dto.description,
      store: dto.storeId ? { connect: { id: dto.storeId } } : undefined,
      coach: dto.coachId ? { connect: { id: dto.coachId } } : undefined,
    };
    return this.prisma.service.create({ data });
  }

  async findAll(tenantId: number, pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { coach: { select: { id: true, displayName: true, avatarUrl: true } } },
      }),
      this.prisma.service.count({ where: { tenantId } }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number, tenantId: number) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: { coach: { select: { id: true, displayName: true, avatarUrl: true } } },
    });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    return service;
  }

  async update(id: number, dto: Partial<CreateServiceDto>, tenantId: number) {
    await this.findOne(id, tenantId);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.durationMinutes !== undefined) data.durationMinutes = dto.durationMinutes;
    if (dto.storeId !== undefined) data.store = { connect: { id: dto.storeId } };
    if (dto.coachId !== undefined) data.coach = { connect: { id: dto.coachId } };
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' as any },
    });
  }
}
