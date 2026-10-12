import { create } from 'zustand';
import { Journey, TransportMode } from '../types/journey';
import { SearchFilters, SortOption } from '../types/search';
import { apiClient } from '../services/apiClient';

interface SearchState {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  passengers: number;
  selectedModes: TransportMode[];
  filters: SearchFilters;
  sortBy: SortOption;
  
  results: Journey[];
  isLoading: boolean;
  error: string | null;

  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  setDate: (date: string) => void;
  setReturnDate: (date?: string) => void;
  setPassengers: (count: number) => void;
  toggleMode: (mode: TransportMode) => void;
  setAllModes: (modes: TransportMode[]) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilter: (key: keyof SearchFilters) => void;
  resetAllFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  swapLocations: () => void;
  executeSearch: () => Promise<void>;
}

const DEFAULT_MODES: TransportMode[] = ['flight', 'train', 'metro', 'bus', 'cab', 'auto'];

export const useSearchStore = create<SearchState>((set, get) => ({
  origin: 'Bengaluru',
  destination: 'Chennai',
  date: new Date().toISOString().split('T')[0],
  passengers: 1,
  selectedModes: DEFAULT_MODES,
  filters: {},
  sortBy: 'recommended',
  results: [],
  isLoading: false,
  error: null,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setDate: (date) => set({ date }),
  setReturnDate: (returnDate) => set({ returnDate }),
  setPassengers: (passengers) => set({ passengers }),

  toggleMode: (mode) => {
    const { selectedModes } = get();
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        set({ selectedModes: selectedModes.filter((m) => m !== mode) });
      }
    } else {
      set({ selectedModes: [...selectedModes, mode] });
    }
    get().executeSearch();
  },

  setAllModes: (selectedModes) => {
    set({ selectedModes });
    get().executeSearch();
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().executeSearch();
  },

  clearFilter: (key) => {
    const nextFilters = { ...get().filters };
    delete nextFilters[key];
    set({ filters: nextFilters });
    get().executeSearch();
  },

  resetAllFilters: () => {
    set({ filters: {}, selectedModes: DEFAULT_MODES });
    get().executeSearch();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().executeSearch();
  },

  swapLocations: () => {
    const { origin, destination } = get();
    set({ origin: destination, destination: origin });
    get().executeSearch();
  },

  executeSearch: async () => {
    const { origin, destination, date, selectedModes, filters, sortBy } = get();
    set({ isLoading: true, error: null });
    try {
      const results = await apiClient.searchJourneys({
        origin,
        destination,
        date,
        modes: selectedModes,
        filters,
        sort_by: sortBy,
      });
      set({ results, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error fetching journeys', isLoading: false });
    }
  },
}));
