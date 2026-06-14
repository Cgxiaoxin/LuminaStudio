import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateCouponTemplateDto } from './dto/create-coupon-template.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  @Post('templates')
  @Roles('OWNER', 'ADMIN')
  createTemplate(@Body() dto: CreateCouponTemplateDto, @Req() req: RequestWithUser) {
    return this.marketingService.createTemplate(dto, req.user.tenantId);
  }

  @Get('templates')
  @Roles('OWNER', 'ADMIN')
  findAllTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Req() req?: any,
  ) {
    return this.marketingService.findAllTemplates(req.user.tenantId, { page, limit, status });
  }

  @Get('templates/:id')
  @Roles('OWNER', 'ADMIN')
  findOneTemplate(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.marketingService.findOneTemplate(id, req.user.tenantId);
  }

  @Patch('templates/:id')
  @Roles('OWNER', 'ADMIN')
  updateTemplate(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCouponTemplateDto>, @Req() req: RequestWithUser) {
    return this.marketingService.updateTemplate(id, dto, req.user.tenantId);
  }

  @Delete('templates/:id')
  @Roles('OWNER', 'ADMIN')
  removeTemplate(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.marketingService.removeTemplate(id, req.user.tenantId);
  }

  @Post('issue')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  issueCoupon(@Body() body: { templateId: number; clientId: number }, @Req() req: RequestWithUser) {
    return this.marketingService.issueCoupon(body.templateId, body.clientId, req.user.tenantId);
  }

  @Get('client-coupons/:clientId')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  findClientCoupons(@Param('clientId', ParseIntPipe) clientId: number, @Req() req: RequestWithUser) {
    return this.marketingService.findClientCoupons(req.user.tenantId, clientId);
  }
}
