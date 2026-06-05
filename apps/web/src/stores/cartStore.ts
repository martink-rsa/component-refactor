import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CartItem } from '@/types/product';

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  clear: () => void;
};

/**
 * Global, persistent shopping cart.
 *
 * Replaces the local `cart` state plus the manual localStorage load/save
 * effects that previously lived in ProductPageClient — persistence is handled
 * declaratively by the `persist` middleware.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
