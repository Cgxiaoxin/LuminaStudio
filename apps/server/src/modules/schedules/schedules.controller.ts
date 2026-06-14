import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Body() dto: CreateScheduleDto, @Req() req: RequestWithUser) {
    return this.schedulesService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() query: QueryScheduleDto, @Req() req: RequestWithUser) {
    return this.schedulesService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.schedulesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
    @Req() req: RequestWithUser,
  ) {
    return this.schedulesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.schedulesService.remove(id, req.user.tenantId);
  }
}
