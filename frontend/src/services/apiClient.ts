import { Journey } from '../types/journey';
import { DemoBooking, Passenger } from '../types/booking';
import { SearchFilters, SortOption } from '../types/search';
import { AIActionProposal } from '../types/ai';

const API_BASE = '/api';

export const apiClient = {
  async getCities(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/metadata/cities`);
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
    const url = new URL(`${window.location.origin}${API_BASE}/journeys/search`);
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
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
    return await res.json();
  },

  async getJourneyById(id: string): Promise<Journey> {
    const res = await fetch(`${API_BASE}/journeys/${id}`);
    if (!res.ok) throw new Error('Journey not found');
    return await res.json();
  },

  async planMultimodal(legs: any[]): Promise<Journey> {
    const res = await fetch(`${API_BASE}/multimodal/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legs),
    });
    if (!res.ok) throw new Error('Failed to plan multimodal itinerary');
    return await res.json();
  },

  async getBookings(): Promise<DemoBooking[]> {
    const res = await fetch(`${API_BASE}/bookings`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  },

  async getBookingById(id: string): Promise<DemoBooking> {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
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
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey: payload.journey,
        journey_id: payload.journey.id,
        passengers: payload.passengers,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        notes: payload.notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to create demo booking');
    return await res.json();
  },

  async cancelBooking(id: string): Promise<DemoBooking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
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
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/ai/quick-prompts`);
    if (!res.ok) return [];
    return await res.json();
  },
};
