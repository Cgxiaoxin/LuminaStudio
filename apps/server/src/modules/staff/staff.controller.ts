import { Controller, Get, Post, Body, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/auth.decorator';
import { RequestWithUser } from '../../common/types/request';

@Controller('admin-users')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Body() dto: CreateStaffDto, @Req() req: RequestWithUser) {
    return this.staffService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Req() req: RequestWithUser) {
    return this.staffService.findAll(req.user.tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.staffService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.staffService.remove(id, req.user.tenantId);
  }
}
