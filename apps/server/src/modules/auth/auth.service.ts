import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto, WeappLoginDto } from './dto/login.dto';
import { WeChatService } from './wechat.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private wechatService: WeChatService,
  ) {}

  async adminLogin(dto: AdminLoginDto, tenantId: number) {
    const user = await this.prisma.adminUser.findFirst({
      where: {
        tenantId,
        username: dto.username,
        status: 'ACTIVE',
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      storeId: user.storeId,
      role: user.role,
      type: 'admin' as const,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async weappLogin(dto: WeappLoginDto, tenantId = 1) {
    const session = await this.wechatService.codeToSession(dto.code);

    let client = await this.prisma.client.findFirst({
      where: { tenantId, openid: session.openid },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          tenantId,
          openid: session.openid,
          unionId: session.unionid,
          status: 'ACTIVE',
        },
      });
    }

    const payload = {
      sub: client.id,
      tenantId: client.tenantId,
      role: 'CLIENT',
      type: 'client' as const,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      client: {
        id: client.id,
        tenantId: client.tenantId,
        nickname: client.nickname,
        phone: client.phone,
        avatarUrl: client.avatarUrl,
      },
    };
  }

  async bindPhone(clientId: number, tenantId: number, phone: string) {
    const existing = await this.prisma.client.findFirst({
      where: { tenantId, phone, NOT: { id: clientId } },
    });
    if (existing) {
      throw new ConflictException('Phone number already bound to another account');
    }

    return this.prisma.client.update({
      where: { id: clientId },
      data: { phone },
      select: { id: true, nickname: true, phone: true, avatarUrl: true },
    });
  }

  async getProfile(userId: number, userType: string) {
    if (userType === 'admin') {
      return this.prisma.adminUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
          tenantId: true,
          storeId: true,
        },
      });
    }
    return this.prisma.client.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        phone: true,
        avatarUrl: true,
        tenantId: true,
      },
    });
  }
}
