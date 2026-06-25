import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestWithUser } from '../../common/types/request';
import { Public } from '../auth/auth.decorator';
import { resolveTenantId } from '../../common/utils/resolve-tenant';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceDto, @Req() req: RequestWithUser) {
    return this.servicesService.create(dto, req.user.tenantId);
  }

  @Get()
  @Public()
  findAll(@Query() pagination: PaginationDto, @Req() req: RequestWithUser) {
    return this.servicesService.findAll(resolveTenantId(req), pagination);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.servicesService.findOne(id, resolveTenantId(req));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateServiceDto>,
    @Req() req: RequestWithUser,
  ) {
    return this.servicesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.servicesService.remove(id, req.user.tenantId);
  }
}
