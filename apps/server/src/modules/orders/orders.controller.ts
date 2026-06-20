import { Controller, Get, Post, Body, Param, Query, Req, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Body() dto: CreateOrderDto, @Req() req: RequestWithUser) {
    return this.ordersService.create(dto, req.user.tenantId);
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
    return this.ordersService.findAll(req.user.tenantId, {
      clientId: resolvedClientId,
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.ordersService.findOne(id, req.user.tenantId, req.user.type === 'client' ? req.user.id : undefined);
  }
}
