import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

export type ReviewSort = 'newest' | 'highest' | 'lowest';
export type ProductTab = 'description' | 'reviews' | 'delivery';

/** Known coupon codes mapped to their discount fraction (0–1). */
const COUPONS: Record<string, number> = {
  WELCOME10: 1,
  SAVE20: 0.2,
};

export type ProductUiState = {
  selectedImage: string;
  quantity: number;
  postcode: string;
  couponCode: string;
  couponMessage: string;
  discount: number;
  isWishlisted: boolean;
  sortReviewsBy: ReviewSort;
  activeTab: ProductTab;

  setSelectedImage: (image: string) => void;
  setQuantity: (quantity: number) => void;
  setPostcode: (postcode: string) => void;
  setCouponCode: (couponCode: string) => void;
  applyCoupon: () => void;
  setWishlisted: (isWishlisted: boolean) => void;
  setSortReviewsBy: (sort: ReviewSort) => void;
  setActiveTab: (tab: ProductTab) => void;
};

/**
 * Factory for the per-product UI store.
 *
 * A fresh instance is created per ProductUiStoreProvider mount so that
 * ephemeral view state (selected image, quantity, coupon, tab, …) is scoped to
 * a single product and never bleeds across product navigations. Exported so it
 * can be exercised directly in unit tests without rendering a Provider.
 */
export const createProductUiStore = () =>
  createStore<ProductUiState>()((set, get) => ({
    selectedImage: '',
    quantity: 1,
    postcode: '',
    couponCode: '',
    couponMessage: '',
    discount: 0,
    isWishlisted: false,
    sortReviewsBy: 'newest',
    activeTab: 'description',

    setSelectedImage: (selectedImage) => set({ selectedImage }),
    setQuantity: (quantity) =>
      set({ quantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity }),
    setPostcode: (postcode) => set({ postcode }),
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
    setWishlisted: (isWishlisted) => set({ isWishlisted }),
    setSortReviewsBy: (sortReviewsBy) => set({ sortReviewsBy }),
    setActiveTab: (activeTab) => set({ activeTab }),
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
