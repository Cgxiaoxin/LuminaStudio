export interface UnifiedOrderRequest {
  orderId: number;
  orderNo: string;
  amount: number;
  description: string;
  clientOpenId?: string;
}

export interface UnifiedOrderResult {
  channel: string;
  prepayId?: string;
  paymentParams?: Record<string, string>;
  devMode?: boolean;
}

export interface PaymentGateway {
  readonly channel: string;
  createUnifiedOrder(request: UnifiedOrderRequest): Promise<UnifiedOrderResult>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
