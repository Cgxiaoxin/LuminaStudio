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
    const mchId = this.config.get<string>('WECHAT_MCH_ID');
    const apiKey = this.config.get<string>('WECHAT_API_V3_KEY');
    return !appId || appId === 'your-appid' || !mchId || !apiKey;
  }

  getConfigStatus() {
    const appId = this.config.get<string>('WECHAT_APPID');
    const secret = this.config.get<string>('WECHAT_SECRET');
    const mchId = this.config.get<string>('WECHAT_MCH_ID');
    const apiKey = this.config.get<string>('WECHAT_API_V3_KEY');
    const notifyUrl = this.config.get<string>('WECHAT_PAY_NOTIFY_URL');

    const loginConfigured = !!(appId && secret && appId !== 'your-appid' && secret !== 'your-secret');
    const paymentConfigured = !!(loginConfigured && mchId && apiKey && notifyUrl);

    return {
      devMode: !paymentConfigured,
      loginConfigured,
      paymentConfigured,
      missing: [
        !appId || appId === 'your-appid' ? 'WECHAT_APPID' : null,
        !secret || secret === 'your-secret' ? 'WECHAT_SECRET' : null,
        !mchId ? 'WECHAT_MCH_ID' : null,
        !apiKey ? 'WECHAT_API_V3_KEY' : null,
        !notifyUrl ? 'WECHAT_PAY_NOTIFY_URL' : null,
      ].filter(Boolean),
    };
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

    // Production: integrate WeChat Pay API v3 JSAPI unified order here.
    throw new Error(
      `WeChat Pay production mode requires: ${this.getConfigStatus().missing.join(', ')}`,
    );
  }
}
