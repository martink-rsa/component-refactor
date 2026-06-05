import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

/** Known coupon codes mapped to their discount fraction (0–1). */
const COUPONS: Record<string, number> = {
  WELCOME10: 0.1,
  SAVE20: 0.2,
};

export type ProductUiState = {
  quantity: number;
  couponCode: string;
  couponMessage: string;
  discount: number;

  setQuantity: (quantity: number) => void;
  setCouponCode: (couponCode: string) => void;
  applyCoupon: () => void;
};

/**
 * Factory for the per-product UI store.
 *
 * A fresh instance is created per ProductUiStoreProvider mount so this state is
 * scoped to a single product and never bleeds across product navigations.
 */
export const createProductUiStore = () =>
  createStore<ProductUiState>()((set, get) => ({
    quantity: 1,
    couponCode: '',
    couponMessage: '',
    discount: 0,

    setQuantity: (quantity) =>
      set({ quantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity }),
    setCouponCode: (couponCode) => set({ couponCode }),
    applyCoupon: () => {
      const code = get().couponCode;

      if (code in COUPONS) {
        set({ discount: COUPONS[code], couponMessage: 'Coupon applied' });
        return;
      }

      if (code.trim().length === 0) {
        set({ couponMessage: 'Enter a coupon code' });
        return;
      }

      set({ discount: 0, couponMessage: 'Invalid coupon' });
    },
  }));

export type ProductUiStore = ReturnType<typeof createProductUiStore>;

export const ProductUiStoreContext = createContext<ProductUiStore | null>(null);

/**
 * Read from the scoped product UI store with a selector. Pass an atomic
 * selector (e.g. `(s) => s.quantity`) so a component only re-renders when the
 * slice it reads changes.
 */
export function useProductUiStore<T>(
  selector: (state: ProductUiState) => T,
): T {
  const store = useContext(ProductUiStoreContext);

  if (store === null) {
    throw new Error(
      'useProductUiStore must be used within a ProductUiStoreProvider',
    );
  }

  return useStore(store, selector);
}
