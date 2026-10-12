import { create } from 'zustand';
import { Journey, JourneyLeg } from '../types/journey';
import { apiClient } from '../services/apiClient';

interface PlannerState {
  legs: JourneyLeg[];
  activeItinerary: Journey | null;
  isLoading: boolean;
  error: string | null;
  
  addLeg: (leg: JourneyLeg) => void;
  removeLeg: (id: string) => void;
  reorderLegs: (fromIndex: number, toIndex: number) => void;
  replaceLeg: (id: string, newLeg: JourneyLeg) => void;
  setInitialLegs: (legs: JourneyLeg[]) => void;
  recalculateItinerary: () => Promise<void>;
  resetPlanner: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  legs: [],
  activeItinerary: null,
  isLoading: false,
  error: null,

  setInitialLegs: (legs) => {
    set({ legs });
    get().recalculateItinerary();
  },

  addLeg: (leg) => {
    set({ legs: [...get().legs, leg] });
    get().recalculateItinerary();
  },

  removeLeg: (id) => {
    set({ legs: get().legs.filter((l) => l.id !== id) });
    get().recalculateItinerary();
  },

  reorderLegs: (fromIndex, toIndex) => {
    const list = [...get().legs];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    set({ legs: list });
    get().recalculateItinerary();
  },

  replaceLeg: (id, newLeg) => {
    const list = get().legs.map((l) => (l.id === id ? newLeg : l));
    set({ legs: list });
    get().recalculateItinerary();
  },

  recalculateItinerary: async () => {
    const { legs } = get();
    if (legs.length === 0) {
      set({ activeItinerary: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const composite = await apiClient.planMultimodal(legs);
      set({ activeItinerary: composite, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error composing multimodal journey', isLoading: false });
    }
  },

  resetPlanner: () => {
    set({ legs: [], activeItinerary: null });
  },
}));
