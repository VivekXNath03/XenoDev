import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  token: authService.getStoredToken(),
  isAuthenticated: !!authService.getStoredToken(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // authService.login already returns the response data ({ token, user })
      const { token, user } = await authService.login(email, password);
      authService.setAuthData(token, user);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),

  signup: async (organizationName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.signup({ organizationName, email, password });
      authService.setAuthData(token, user);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Signup failed';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },
}));
