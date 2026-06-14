import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto, WeappLoginDto } from './dto/login.dto';
import { Public } from './auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from '../../common/types/request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('admin-login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    // TODO: Resolve tenantId from context or header
    return this.authService.adminLogin(dto, 1);
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
