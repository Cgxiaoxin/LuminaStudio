import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestWithUser } from '../../common/types/request';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceDto, @Req() req: RequestWithUser) {
    return this.servicesService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Req() req: RequestWithUser) {
    return this.servicesService.findAll(req.user.tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.servicesService.findOne(id, req.user.tenantId);
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
