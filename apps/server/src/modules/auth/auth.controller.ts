import { Controller, Post, Body, Get, Req, UseGuards, Patch, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto, WeappLoginDto, BindPhoneDto, BindPhoneCodeDto } from './dto/login.dto';
import { Public } from './auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { RequestWithUser } from '../../common/types/request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('admin-login')
  async adminLogin(@Body() dto: AdminLoginDto, @TenantId() tenantId?: number) {
    return this.authService.adminLogin(dto, tenantId || 1);
  }

  @Public()
  @Post('weapp-login')
  async weappLogin(@Body() dto: WeappLoginDto, @TenantId() tenantId?: number) {
    return this.authService.weappLogin(dto, tenantId || 1);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id, req.user.type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@Req() req: RequestWithUser) {
    if (req.user.type !== 'client') {
      throw new ForbiddenException('Client only');
    }
    return this.authService.getClientStats(req.user.id, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Body() dto: { nickname?: string }, @Req() req: RequestWithUser) {
    if (req.user.type !== 'client') {
      throw new ForbiddenException('Client only');
    }
    return this.authService.updateClientProfile(req.user.id, req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bind-phone')
  async bindPhone(@Body() dto: BindPhoneDto, @Req() req: RequestWithUser) {
    return this.authService.bindPhone(req.user.id, req.user.tenantId, dto.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bind-phone-code')
  async bindPhoneByCode(@Body() dto: BindPhoneCodeDto, @Req() req: RequestWithUser) {
    return this.authService.bindPhoneByCode(req.user.id, req.user.tenantId, dto.code);
  }
}
