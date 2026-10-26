import { create } from 'zustand';
import { AIMessage, AIActionProposal } from '../types/ai';
import { apiClient } from '../services/apiClient';
import { useSearchStore } from './useSearchStore';
import { useBookingStore } from './useBookingStore';
import { usePlannerStore } from './usePlannerStore';
import { useAuthStore } from './useAuthStore';

interface AIState {
  isOpen: boolean;
  messages: AIMessage[];
  isThinking: boolean;
  quickPrompts: { label: string; prompt: string }[];

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  sendMessage: (text: string) => Promise<void>;
  executeAction: (proposal: AIActionProposal) => Promise<void>;
  clearHistory: () => void;
  fetchQuickPrompts: () => Promise<void>;
}

export const useAiStore = create<AIState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'welcome_1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hi there! I'm your TripPilot travel companion. I can help you search, compare, and connect journeys across flights, trains, buses, metro, cabs, and autos. Try asking something like *'Find the cheapest morning train to Chennai under ₹1,000'* or *'Plan a door-to-door trip combining a train and a cab'*.",
    },
  ],
  isThinking: false,
  quickPrompts: [],

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set({ isOpen: !get().isOpen }),

  fetchQuickPrompts: async () => {
    try {
      const prompts = await apiClient.getQuickPrompts();
      set({ quickPrompts: prompts });
    } catch (e) {
      console.warn('Could not fetch quick prompts:', e);
    }
  },

  sendMessage: async (text: string) => {
    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    set({
      messages: [...get().messages, userMsg],
      isThinking: true,
    });

    try {
      const searchState = useSearchStore.getState();
      const response = await apiClient.chatWithAI({
        prompt: text,
        current_search: {
          origin: searchState.origin,
          destination: searchState.destination,
        },
        active_filters: searchState.filters,
      });

      const assistantMsg: AIMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.reply_text,
        action_proposal: response.action_proposal,
      };

      set({
        messages: [...get().messages, assistantMsg],
        isThinking: false,
      });

      // Auto-execute safe non-destructive actions immediately
      if (response.action_proposal && !response.action_proposal.requires_user_confirmation) {
        await get().executeAction(response.action_proposal);
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I ran into a temporary connection issue while processing your request. Please try asking again in a moment, or adjust your search filters manually above.",
      };
      set({
        messages: [...get().messages, errorMsg],
        isThinking: false,
      });
    }
  },

  executeAction: async (proposal: AIActionProposal) => {
    const searchStore = useSearchStore.getState();
    const bookingStore = useBookingStore.getState();

    if (proposal.action === 'search_journeys') {
      const p = proposal.parameters;
      if (p.origin) searchStore.setOrigin(p.origin);
      if (p.destination) searchStore.setDestination(p.destination);
      if (p.modes) searchStore.setAllModes(p.modes);
      if (p.filters) searchStore.setFilters(p.filters);
      if (p.sort_by) searchStore.setSortBy(p.sort_by);
      await searchStore.executeSearch();
    } else if (proposal.action === 'plan_multimodal_trip') {
      const p = proposal.parameters;
      if (p.origin) searchStore.setOrigin(p.origin);
      if (p.destination) searchStore.setDestination(p.destination);
      if (p.legs && Array.isArray(p.legs) && p.legs.length > 0) {
        usePlannerStore.getState().setInitialLegs(p.legs);
      }
    } else if (proposal.action === 'quick_book') {
      const j = proposal.parameters.journey;
      if (j) {
        bookingStore.setDraftJourney(j);
      }
    } else if (proposal.action === 'cancel_demo_booking') {
      const ref = proposal.parameters.reference_number;
      if (ref) {
        await bookingStore.cancelBooking(ref);
      }
    } else if (proposal.action === 'get_bookings') {
      await bookingStore.fetchBookings();
    } else if (proposal.action === 'open_login') {
      useAuthStore.getState().openAuthModal('login', 'Please sign in to view your travel bookings');
    }

    // Mark action as executed in conversation
    set({
      messages: get().messages.map((m) =>
        m.action_proposal === proposal ? { ...m, action_executed: true } : m
      ),
    });
  },

  clearHistory: () => {
    set({
      messages: [
        {
          id: 'welcome_1',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "Conversation cleared. Where would you like to travel next?",
        },
      ],
    });
  },
}));
