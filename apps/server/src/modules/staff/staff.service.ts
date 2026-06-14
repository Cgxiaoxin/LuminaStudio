import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStaffDto, tenantId: number) {
    const existing = await this.prisma.adminUser.findFirst({
      where: { tenantId, username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.adminUser.create({
      data: {
        tenantId,
        username: dto.username,
        passwordHash,
        displayName: dto.displayName,
        role: dto.role as any,
        storeId: dto.storeId,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        phone: dto.phone,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        storeId: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async findAll(tenantId: number, pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
          status: true,
          storeId: true,
          bio: true,
          avatarUrl: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.adminUser.count({ where: { tenantId } }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number, tenantId: number) {
    const staff = await this.prisma.adminUser.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        status: true,
        storeId: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!staff) {
      throw new NotFoundException(`Staff ${id} not found`);
    }
    return staff;
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);
    return this.prisma.adminUser.update({
      where: { id },
      data: { status: 'DISABLED' },
    });
  }
}
