import { Journey } from './journey';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Passenger {
  id?: string;
  full_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seat_preference?: string;
  email: string;
  phone: string;
}

export interface FareBreakdown {
  base_fare: number;
  taxes_and_fees: number;
  discounts: number;
  total_amount: number;
}

export interface DemoBooking {
  id: string;
  reference_number: string;
  created_at: string;
  status: BookingStatus;
  journey: Journey;
  passengers: Passenger[];
  fare_breakdown: FareBreakdown;
  contact_email: string;
  contact_phone: string;
  notes?: string;
  is_simulated_demo: boolean;
  payment_status?: 'PAID' | 'PENDING' | 'FAILED' | string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  payment_method?: string;
}
