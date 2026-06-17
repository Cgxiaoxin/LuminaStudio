import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { WeChatPayGateway } from './gateway/wechat-pay.gateway';
import { PAYMENT_GATEWAY } from './gateway/payment-gateway.interface';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    WeChatPayGateway,
    { provide: PAYMENT_GATEWAY, useExisting: WeChatPayGateway },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
