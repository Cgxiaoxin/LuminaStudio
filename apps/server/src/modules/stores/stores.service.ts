import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto, tenantId: number) {
    return this.prisma.store.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: number, pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where: { tenantId } }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number, tenantId: number) {
    const store = await this.prisma.store.findFirst({
      where: { id, tenantId },
    });
    if (!store) {
      throw new NotFoundException(`Store ${id} not found`);
    }
    return store;
  }

  async update(id: number, dto: UpdateStoreDto, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.store.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
