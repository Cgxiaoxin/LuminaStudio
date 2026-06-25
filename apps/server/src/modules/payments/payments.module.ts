import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { WeChatPayGateway } from './gateway/wechat-pay.gateway';
import { PAYMENT_GATEWAY } from './gateway/payment-gateway.interface';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [PrismaModule, forwardRef(() => MembershipsModule)],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    WeChatPayGateway,
    { provide: PAYMENT_GATEWAY, useExisting: WeChatPayGateway },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
