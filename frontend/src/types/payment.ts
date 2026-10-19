export interface PaymentConfig {
  key_id: string;
  currency: string;
  is_test_mode: boolean;
  has_live_credentials: boolean;
  gateway_name: string;
}

export interface RazorpayOrder {
  order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  receipt: string;
  key_id: string;
  is_simulated: boolean;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id?: string;
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
      close: () => void;
    };
  }
}
