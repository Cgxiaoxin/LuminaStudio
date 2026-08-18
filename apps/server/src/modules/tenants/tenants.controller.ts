import { Controller, Get, Post, Body, Patch, Param, Query, Req, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public, Roles } from '../auth/auth.decorator';
import { RequestWithUser } from '../../common/types/request';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Req() req: RequestWithUser) {
    return this.tenantsService.findAll(pagination, req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    this.assertOwnTenant(id, req.user.tenantId);
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenantDto,
    @Req() req: RequestWithUser,
  ) {
    this.assertOwnTenant(id, req.user.tenantId);
    return this.tenantsService.update(id, dto);
  }

  private assertOwnTenant(id: number, tenantId: number) {
    if (id !== tenantId) {
      throw new ForbiddenException('Cannot access another tenant');
    }
  }
}
