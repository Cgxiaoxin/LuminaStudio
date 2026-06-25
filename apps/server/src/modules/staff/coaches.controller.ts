import { Controller, Get, Param, Query, Req, ParseIntPipe } from '@nestjs/common';
import { StaffService } from './staff.service';
import { RequestWithUser } from '../../common/types/request';

@Controller('coaches')
export class CoachesController {
  constructor(private staffService: StaffService) {}

  @Get()
  findAll(
    @Query('storeId') storeId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: RequestWithUser,
  ) {
    return this.staffService.findCoaches(req!.user.tenantId, { storeId, page, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.staffService.findCoach(id, req.user.tenantId);
  }
}
