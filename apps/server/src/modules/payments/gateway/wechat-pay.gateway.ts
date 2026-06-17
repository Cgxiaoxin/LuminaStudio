import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  UnifiedOrderRequest,
  UnifiedOrderResult,
} from './payment-gateway.interface';

@Injectable()
export class WeChatPayGateway implements PaymentGateway {
  readonly channel = 'wechat';

  constructor(private config: ConfigService) {}

  private isDevMode(): boolean {
    const appId = this.config.get<string>('WECHAT_APPID');
    return !appId || appId === 'your-appid';
  }

  async createUnifiedOrder(request: UnifiedOrderRequest): Promise<UnifiedOrderResult> {
    if (this.isDevMode()) {
      return {
        channel: this.channel,
        devMode: true,
        prepayId: `dev_prepay_${request.orderId}`,
        paymentParams: {
          orderId: String(request.orderId),
          orderNo: request.orderNo,
          amount: String(request.amount),
        },
      };
    }

    // Production: integrate WeChat Pay v3 unified order API here.
    throw new Error('WeChat Pay production mode is not configured');
  }
}
