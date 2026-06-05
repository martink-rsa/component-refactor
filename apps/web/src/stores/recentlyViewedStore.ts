import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Product } from '@/types/product';

/** Maximum number of products kept in the recently-viewed list. */
export const MAX_RECENTLY_VIEWED = 5;

type RecentlyViewedState = {
  items: Product[];
  addProduct: (product: Product) => void;
};

/**
 * Global, persistent "recently viewed" list.
 *
 * `addProduct` prepends the product, de-dupes by id (so re-visiting a product
 * moves it to the front instead of creating duplicates) and caps the list at
 * MAX_RECENTLY_VIEWED.
 */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (product) => {
        const withoutProduct = get().items.filter(
          (item) => item.id !== product.id,
        );

        set({
          items: [product, ...withoutProduct].slice(0, MAX_RECENTLY_VIEWED),
        });
      },
    }),
    {
      name: 'recentlyViewed',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
