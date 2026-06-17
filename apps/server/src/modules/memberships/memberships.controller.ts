import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { ConsumeSessionDto } from './dto/consume-session.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  create(@Body() dto: CreateMembershipDto, @Req() req: RequestWithUser) {
    return this.membershipsService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const resolvedClientId = req.user.type === 'client' ? req.user.id : clientId;
    return this.membershipsService.findAll(req.user.tenantId, {
      clientId: resolvedClientId, status, page, limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.membershipsService.findOne(id, req.user.tenantId);
  }

  @Get(':id/usage')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  findUsage(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    return this.membershipsService.findUsage(id, req.user.tenantId, page, limit);
  }

  @Post(':id/consume')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  consume(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConsumeSessionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.membershipsService.consume(id, req.user.tenantId, dto);
  }

  @Patch(':id/cancel')
  @Roles('OWNER', 'ADMIN')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.membershipsService.cancel(id, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.membershipsService.cancel(id, req.user.tenantId);
  }
}
