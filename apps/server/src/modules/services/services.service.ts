import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto, tenantId: number) {
    return this.prisma.service.create({
      data: {
        ...dto,
        tenantId,
        price: dto.price,
      },
    });
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
        include: { coach: { select: { id: true, name: true } } },
      }),
      this.prisma.service.count({ where: { tenantId } }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number, tenantId: number) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: { coach: { select: { id: true, name: true } } },
    });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    return service;
  }

  async update(id: number, dto: Partial<CreateServiceDto>, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
