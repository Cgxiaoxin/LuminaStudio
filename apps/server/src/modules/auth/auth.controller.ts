import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto, WeappLoginDto } from './dto/login.dto';
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
  async weappLogin(@Body() dto: WeappLoginDto) {
    return this.authService.weappLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id, req.user.type);
  }
}
