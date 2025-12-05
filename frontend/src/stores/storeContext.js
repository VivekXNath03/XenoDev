import { create } from 'zustand';

export const useStoreContext = create((set) => ({
  selectedStore: null,
  stores: [],
  isLoading: false,
  error: null,

  setSelectedStore: (store) => set({ selectedStore: store }),
  
  setStores: (stores) => {
    const selected = stores.length > 0 ? stores[0] : null;
    set({ stores, selectedStore: selected });
  },

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
