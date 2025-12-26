// Shared types for trigger.dev tasks

export interface OrderFulfillmentPayload {
  orderId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  correlationId: string;
}

export interface StepPayload {
  sagaId: string;
  orderId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  correlationId: string;
}

export interface PaymentStepPayload {
  sagaId: string;
  orderId: string;
  totalAmount: number;
}

export interface FulfillStepPayload extends StepPayload {
  paymentReference: string;
}

export interface CompensationPayload {
  correlationId: string;
  orderId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  triggerRunId: string;
}

export interface ReleaseStockPayload {
  sagaId: string;
  orderId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  correlationId: string;
}

export interface VoidPaymentPayload {
  sagaId: string;
  orderId: string;
  paymentReference?: string;
}
