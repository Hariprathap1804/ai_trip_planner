import { create } from 'zustand';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { apiClient } from '../services/apiClient';

const TOKEN_KEY = 'trippilot_auth_token';
const USER_KEY = 'trippilot_auth_user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Modal control
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalReason: string | null;

  openAuthModal: (mode?: 'login' | 'register', reason?: string) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  isAuthModalOpen: false,
  authModalMode: 'login',
  authModalReason: null,

  openAuthModal: (mode = 'login', reason) => {
    set({
      isAuthModalOpen: true,
      authModalMode: mode,
      authModalReason: reason || null,
      error: null,
    });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      authModalReason: null,
      error: null,
    });
  },

  setAuthModalMode: (authModalMode) => {
    set({ authModalMode, error: null });
  },

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.login(credentials);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        isAuthModalOpen: false,
        authModalReason: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.register(credentials);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        isAuthModalOpen: false,
        authModalReason: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    // Clear in-memory bookings state
    import('./useBookingStore').then(({ useBookingStore }) => {
      useBookingStore.setState({ bookings: [], activeDraftJourney: null });
    }).catch(() => {});
  },

  initAuth: async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUserStr = localStorage.getItem(USER_KEY);

    if (!savedToken) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    let cachedUser: User | null = null;
    if (savedUserStr) {
      try {
        cachedUser = JSON.parse(savedUserStr);
      } catch (e) {
        console.warn('Could not parse cached user:', e);
      }
    }

    // Set optimistic state immediately so UI doesn't flicker
    if (cachedUser) {
      set({ user: cachedUser, token: savedToken, isAuthenticated: true });
    }

    // Validate token with backend /api/auth/me
    try {
      const verifiedUser = await apiClient.getMe();
      localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
      set({ user: verifiedUser, token: savedToken, isAuthenticated: true });
    } catch (err) {
      console.warn('Session expired or invalid, logging out:', err);
      get().logout();
    }
  },
}));
