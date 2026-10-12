import { create } from 'zustand';
import { Journey } from '../types/journey';

interface ComparisonState {
  comparedJourneys: Journey[];
  isDrawerOpen: boolean;
  addJourney: (journey: Journey) => void;
  removeJourney: (id: string) => void;
  clearComparison: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  comparedJourneys: [],
  isDrawerOpen: false,

  addJourney: (journey) => {
    const { comparedJourneys } = get();
    if (comparedJourneys.some((j) => j.id === journey.id)) return;
    if (comparedJourneys.length >= 3) {
      // Keep at most 3
      set({
        comparedJourneys: [...comparedJourneys.slice(1), journey],
        isDrawerOpen: true,
      });
    } else {
      set({
        comparedJourneys: [...comparedJourneys, journey],
        isDrawerOpen: true,
      });
    }
  },

  removeJourney: (id) => {
    const next = get().comparedJourneys.filter((j) => j.id !== id);
    set({
      comparedJourneys: next,
      isDrawerOpen: next.length > 0 ? get().isDrawerOpen : false,
    });
  },

  clearComparison: () => {
    set({ comparedJourneys: [], isDrawerOpen: false });
  },

  toggleDrawer: () => {
    set({ isDrawerOpen: !get().isDrawerOpen });
  },

  setDrawerOpen: (isDrawerOpen) => {
    set({ isDrawerOpen });
  },
}));
