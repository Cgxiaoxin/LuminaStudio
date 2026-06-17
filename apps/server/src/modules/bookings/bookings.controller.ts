import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @Req() req: RequestWithUser) {
    const clientId = req.user.type === 'client' ? req.user.id : dto.clientId;
    if (!clientId) {
      throw new BadRequestException('clientId is required');
    }
    return this.bookingsService.create(
      { ...dto, clientId },
      req.user.tenantId,
      req.user.type === 'client' ? 'WECHAT_MINIAPP' : 'ADMIN',
    );
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: number,
    @Query('scheduleId') scheduleId?: number,
    @Query('status') status?: string,
    @Query('storeId') storeId?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const resolvedClientId = req.user.type === 'client' ? req.user.id : clientId;
    return this.bookingsService.findAll(req.user.tenantId, {
      clientId: resolvedClientId, scheduleId, status, storeId, dateFrom, dateTo, page, limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.bookingsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id/check-in')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  checkIn(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.bookingsService.checkIn(id, req.user.tenantId);
  }

  @Patch(':id/complete')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  complete(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.bookingsService.complete(id, req.user.tenantId);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingsService.cancel(id, req.user.tenantId, dto);
  }

  @Patch(':id/confirm-payment')
  @Roles('OWNER', 'ADMIN')
  confirmAfterPayment(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.bookingsService.confirmAfterPayment(id, req.user.tenantId);
  }
}
