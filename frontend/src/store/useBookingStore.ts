import { create } from 'zustand';
import { DemoBooking, Passenger } from '../types/booking';
import { Journey } from '../types/journey';
import { apiClient } from '../services/apiClient';

interface BookingState {
  bookings: DemoBooking[];
  activeDraftJourney: Journey | null;
  isLoading: boolean;
  error: string | null;

  setDraftJourney: (journey: Journey | null) => void;
  fetchBookings: () => Promise<void>;
  createBooking: (payload: {
    journey: Journey;
    passengers: Passenger[];
    contact_email: string;
    contact_phone: string;
    notes?: string;
  }) => Promise<DemoBooking>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  activeDraftJourney: null,
  isLoading: false,
  error: null,

  setDraftJourney: (activeDraftJourney) => set({ activeDraftJourney }),

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await apiClient.getBookings();
      set({ bookings: list, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createBooking: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await apiClient.createBooking(payload);
      set({
        bookings: [created, ...get().bookings],
        activeDraftJourney: null,
        isLoading: false,
      });
      return created;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiClient.cancelBooking(id);
      set({
        bookings: get().bookings.map((b) => (b.id === id || b.reference_number === id ? updated : b)),
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
