import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cartStore';

const item = (productId: string) => ({
  productId,
  quantity: 1,
  selectedImage: `${productId}.jpg`,
});

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    localStorage.clear();
  });

  it('adds an item to the cart', () => {
    useCartStore.getState().addItem(item('p1'));

    expect(useCartStore.getState().items).toEqual([item('p1')]);
  });

  it('appends new items without dropping existing ones', () => {
    const { addItem } = useCartStore.getState();
    addItem(item('p1'));
    addItem(item('p2'));

    expect(useCartStore.getState().items.map((i) => i.productId)).toEqual([
      'p1',
      'p2',
    ]);
  });

  it('clears the cart', () => {
    useCartStore.getState().addItem(item('p1'));
    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
  });
});
