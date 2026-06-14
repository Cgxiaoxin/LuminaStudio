import { Controller, Get, Query, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles('OWNER', 'ADMIN')
  dashboard(@Query('storeId') storeId?: number, @Req() req?: any) {
    return this.reportsService.dashboard(req.user.tenantId, storeId ? Number(storeId) : undefined);
  }

  @Get('revenue')
  @Roles('OWNER', 'ADMIN')
  revenue(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string, @Req() req?: any) {
    return this.reportsService.revenueReport(req.user.tenantId, dateFrom, dateTo);
  }

  @Get('bookings')
  @Roles('OWNER', 'ADMIN')
  bookings(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string, @Req() req?: any) {
    return this.reportsService.bookingReport(req.user.tenantId, dateFrom, dateTo);
  }
}
