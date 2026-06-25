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

export class PaymentCanceledError extends Error {
  constructor() {
    super('PAYMENT_CANCELED');
    this.name = 'PaymentCanceledError';
  }
}

type PayOrderOptions = {
  amount?: number;
  title?: string;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForOrderPaid(orderId: number, maxAttempts = 12, delayMs = 800) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const order: any = await request(`/orders/${orderId}`);
    if (order.status === 'PAID') return order;
    await sleep(delayMs);
  }
  throw new Error('支付结果确认中，请稍后在订单页查看');
}

/** 发起微信支付；仅在支付接口确认成功后才返回 */
export async function payOrder(orderId: number, options?: PayOrderOptions): Promise<void> {
  const payRes = await request('/payments/unified-order', {
    method: 'POST',
    data: { orderId, channel: 'wechat' },
  }) as UnifiedOrderResponse;

  if (payRes.unified?.devMode) {
    const amountText = options?.amount != null ? `¥${Number(options.amount).toFixed(2)}` : '';
    const content = options?.title
      ? `商品：${options.title}${amountText ? `\n金额：${amountText}` : ''}\n\n确认后将发起支付`
      : '确认完成支付？';

    const { confirm } = await Taro.showModal({
      title: '确认支付',
      content,
      confirmText: '确认支付',
      cancelText: '取消',
    });
    if (!confirm) throw new PaymentCanceledError();

    await request(`/payments/notify/${payRes.payment.id}`, {
      method: 'POST',
      data: { transactionId: `dev_tx_${Date.now()}`, success: true },
    });
    await waitForOrderPaid(orderId);
    return;
  }

  const params = payRes.unified?.paymentParams;
  if (!params?.timeStamp || !params?.nonceStr || !params?.package || !params?.paySign) {
    throw new Error('微信支付未配置，请联系门店');
  }

  try {
    await Taro.requestPayment({
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: (params.signType as 'RSA' | 'MD5') || 'RSA',
      paySign: params.paySign,
    });
  } catch (err: any) {
    if (err?.errMsg?.includes('cancel')) {
      throw new PaymentCanceledError();
    }
    throw err;
  }

  await waitForOrderPaid(orderId);
}

export function isPaymentCanceled(err: unknown) {
  return err instanceof PaymentCanceledError
    || (err as any)?.name === 'PaymentCanceledError'
    || (err as any)?.errMsg?.includes('cancel');
}
