import Taro from '@tarojs/taro';
import { request } from './api';

type UnifiedOrderResponse = {
  payment: { id: number };
  unified?: {
    devMode?: boolean;
    paymentParams?: {
      timeStamp?: string;
      nonceStr?: string;
      package?: string;
      signType?: string;
      paySign?: string;
    };
  };
};

/** 发起微信支付；开发环境自动模拟 notify 成功 */
export async function payOrder(orderId: number): Promise<void> {
  const payRes = await request('/payments/unified-order', {
    method: 'POST',
    data: { orderId, channel: 'wechat' },
  }) as UnifiedOrderResponse;

  if (payRes.unified?.devMode) {
    await request(`/payments/notify/${payRes.payment.id}`, {
      method: 'POST',
      data: { transactionId: `dev_tx_${Date.now()}`, success: true },
    });
    return;
  }

  const params = payRes.unified?.paymentParams;
  if (!params?.timeStamp || !params?.nonceStr || !params?.package || !params?.paySign) {
    throw new Error('微信支付未配置，请联系门店');
  }

  await Taro.requestPayment({
    timeStamp: params.timeStamp,
    nonceStr: params.nonceStr,
    package: params.package,
    signType: (params.signType as 'RSA' | 'MD5') || 'RSA',
    paySign: params.paySign,
  });
}
