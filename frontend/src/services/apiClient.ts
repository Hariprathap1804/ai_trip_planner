import { Journey } from '../types/journey';
import { DemoBooking, Passenger } from '../types/booking';
import { SearchFilters, SortOption } from '../types/search';
import { AIActionProposal } from '../types/ai';
import { PaymentConfig, RazorpayOrder } from '../types/payment';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api` : '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('trippilot_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export function getFullApiUrl(path: string): URL {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    return new URL(`${API_BASE}${cleanPath}`);
  }
  return new URL(`${window.location.origin}${API_BASE}${cleanPath}`);
}

function formatApiError(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: any) => {
        if (typeof item === 'string') return item;
        const msg = (item.msg || item.message || '').replace(/^Value error,\s*/i, '');
        const field = item.loc ? item.loc[item.loc.length - 1] : '';
        return field ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean)
      .join('. ');
  }
  if (typeof data.message === 'string') return data.message;
  return fallback;
}

export const apiClient = {
  async getCities(): Promise<any[]> {
    try {
      const res = await fetch(getApiEndpoint('/metadata/cities'));
      if (!res.ok) throw new Error('Failed to fetch transit hubs');
      return await res.json();
    } catch (e) {
      console.warn('API error fetching cities, using local fallback:', e);
      return [];
    }
  },

  async searchJourneys(params: {
    origin: string;
    destination: string;
    date?: string;
    modes?: string[];
    filters?: SearchFilters;
    sort_by?: SortOption;
  }): Promise<Journey[]> {
    const url = getFullApiUrl('/journeys/search');
    url.searchParams.set('origin', params.origin);
    url.searchParams.set('destination', params.destination);
    if (params.date) url.searchParams.set('date', params.date);
    if (params.sort_by) url.searchParams.set('sort_by', params.sort_by);
    
    if (params.modes && params.modes.length > 0) {
      params.modes.forEach(m => url.searchParams.append('modes', m));
    }

    if (params.filters) {
      if (params.filters.min_budget) url.searchParams.set('min_budget', params.filters.min_budget.toString());
      if (params.filters.max_budget) url.searchParams.set('max_budget', params.filters.max_budget.toString());
      if (params.filters.max_duration_minutes) url.searchParams.set('max_duration', params.filters.max_duration_minutes.toString());
      if (params.filters.flight_direct_only) url.searchParams.set('flight_direct_only', 'true');
      if (params.filters.bus_ac_only) url.searchParams.set('bus_ac_only', 'true');
      if (params.filters.time_of_day && params.filters.time_of_day.length > 0) {
        params.filters.time_of_day.forEach((tod) => url.searchParams.append('time_of_day', tod));
      }
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
    return await res.json();
  },

  async getJourneyById(id: string): Promise<Journey> {
    const res = await fetch(getApiEndpoint(`/journeys/${id}`));
    if (!res.ok) throw new Error('Journey not found');
    return await res.json();
  },

  async planMultimodal(legs: any[]): Promise<Journey> {
    const res = await fetch(getApiEndpoint('/multimodal/plan'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legs),
    });
    if (!res.ok) throw new Error('Failed to plan multimodal itinerary');
    return await res.json();
  },


  // Authentication APIs
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await fetch(getApiEndpoint('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: credentials.name.trim(),
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        phone: credentials.phone?.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(data, 'Registration failed'));
    }
    return data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(getApiEndpoint('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(data, 'Invalid email or password'));
    }
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(getApiEndpoint('/auth/me'), {
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to authenticate current session');
    }
    return data.user;
  },

  async getBookings(): Promise<DemoBooking[]> {
    const res = await fetch(getApiEndpoint('/bookings'), {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  },

  async getBookingById(id: string): Promise<DemoBooking> {
    const res = await fetch(getApiEndpoint(`/bookings/${id}`), {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Booking not found');
    return await res.json();
  },

  async createBooking(payload: {
    journey: Journey;
    passengers: Passenger[];
    contact_email: string;
    contact_phone: string;
    notes?: string;
  }): Promise<DemoBooking> {
    const res = await fetch(getApiEndpoint('/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        journey: payload.journey,
        journey_id: payload.journey.id,
        passengers: payload.passengers,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        notes: payload.notes,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create booking');
    }
    return await res.json();
  },

  async cancelBooking(id: string): Promise<DemoBooking> {
    const res = await fetch(getApiEndpoint(`/bookings/${id}/cancel`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to cancel booking');
    }
    return await res.json();
  },

  async chatWithAI(params: {
    prompt: string;
    current_search?: any;
    active_filters?: any;
  }): Promise<{
    reply_text: string;
    action_proposal?: AIActionProposal;
    suggested_followups?: string[];
  }> {
    const res = await fetch(getApiEndpoint('/ai/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        prompt: params.prompt,
        current_search: params.current_search,
        active_filters: params.active_filters,
      }),
    });
    if (!res.ok) throw new Error('AI request failed');
    return await res.json();
  },

  async getQuickPrompts(): Promise<{ label: string; prompt: string }[]> {
    const res = await fetch(getApiEndpoint('/ai/quick-prompts'));
    if (!res.ok) return [];
    return await res.json();
  },

  async getPaymentConfig(): Promise<PaymentConfig> {
    const res = await fetch(getApiEndpoint('/payments/config'));
    if (!res.ok) throw new Error('Failed to fetch payment configuration');
    return await res.json();
  },

  async createPaymentOrder(params: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
  }): Promise<{ success: boolean; order: RazorpayOrder }> {
    const res = await fetch(getApiEndpoint('/payments/create-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create payment order');
    }
    return await res.json();
  },

  async verifyPaymentAndBook(params: {
    order_id: string;
    payment_id: string;
    signature: string;
    booking_payload: {
      journey_id?: string;
      journey?: Journey;
      passengers: Passenger[];
      contact_email: string;
      contact_phone: string;
      notes?: string;
    };
    journey_data?: Journey;
  }): Promise<{ success: boolean; message: string; booking: DemoBooking }> {
    const res = await fetch(getApiEndpoint('/payments/verify-and-book'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Payment verification failed');
    }
    return await res.json();
  },
};

