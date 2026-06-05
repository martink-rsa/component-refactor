import { describe, expect, it } from 'vitest';

import { createProductUiStore } from './productUiStore';

describe('productUiStore', () => {
  describe('applyCoupon', () => {
    it('applies WELCOME10 as a full discount', () => {
      const store = createProductUiStore();
      store.getState().setCouponCode('WELCOME10');
      store.getState().applyCoupon();

      expect(store.getState().discount).toBe(1);
      expect(store.getState().couponMessage).toBe('Coupon applied');
    });

    it('applies SAVE20 as a 20% discount', () => {
      const store = createProductUiStore();
      store.getState().setCouponCode('SAVE20');
      store.getState().applyCoupon();

      expect(store.getState().discount).toBe(0.2);
      expect(store.getState().couponMessage).toBe('Coupon applied');
    });

    it('reports an empty coupon code without changing the discount', () => {
      const store = createProductUiStore();
      store.getState().setCouponCode('   ');
      store.getState().applyCoupon();

      expect(store.getState().couponMessage).toBe('Enter a coupon code');
      expect(store.getState().discount).toBe(0);
    });

    it('reports an invalid coupon and resets a previously applied discount', () => {
      const store = createProductUiStore();
      store.getState().setCouponCode('SAVE20');
      store.getState().applyCoupon();

      store.getState().setCouponCode('NOPE');
      store.getState().applyCoupon();

      expect(store.getState().couponMessage).toBe('Invalid coupon');
      expect(store.getState().discount).toBe(0);
    });
  });

  describe('setQuantity', () => {
    it('clamps to a minimum of 1 and rejects NaN', () => {
      const store = createProductUiStore();

      store.getState().setQuantity(0);
      expect(store.getState().quantity).toBe(1);

      store.getState().setQuantity(Number.NaN);
      expect(store.getState().quantity).toBe(1);

      store.getState().setQuantity(4);
      expect(store.getState().quantity).toBe(4);
    });
  });

  it('starts each instance from a clean slate (state is not shared)', () => {
    const first = createProductUiStore();
    first.getState().setActiveTab('reviews');

    const second = createProductUiStore();
    expect(second.getState().activeTab).toBe('description');
  });
});
