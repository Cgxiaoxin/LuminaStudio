import { Controller, Post, Body, Param, Get, Req, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('unified-order')
  createPayment(@Body() dto: CreatePaymentDto, @Req() req: RequestWithUser) {
    return this.paymentsService.createPayment(dto.orderId, dto.channel, req.user.tenantId, req.user);
  }

  @Post('notify/:id')
  async handleNotify(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { transactionId: string; success: boolean },
    @Req() req: RequestWithUser,
  ) {
    return this.paymentsService.handleNotify(
      id,
      body.transactionId,
      body.success,
      req.user.tenantId,
      req.user,
    );
  }

  @Get('order/:orderId')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: RequestWithUser) {
    return this.paymentsService.findByOrder(orderId, req.user.tenantId);
  }
}
