import { Controller, Get, Param, Query, Req, ParseIntPipe } from '@nestjs/common';
import { StaffService } from './staff.service';
import { RequestWithUser } from '../../common/types/request';
import { Public } from '../auth/auth.decorator';
import { resolveTenantId } from '../../common/utils/resolve-tenant';

@Controller('coaches')
export class CoachesController {
  constructor(private staffService: StaffService) {}

  @Get()
  @Public()
  findAll(
    @Query('storeId') storeId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: RequestWithUser,
  ) {
    return this.staffService.findCoaches(resolveTenantId(req!), { storeId, page, limit });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.staffService.findCoach(id, resolveTenantId(req));
  }
}
