import { beforeEach, describe, expect, it } from 'vitest';

import type { Product } from '@/types/product';

import {
  MAX_RECENTLY_VIEWED,
  useRecentlyViewedStore,
} from './recentlyViewedStore';

function makeProduct(id: string): Product {
  return {
    id,
    name: `Product ${id}`,
    sku: id,
    description: '',
    price: 10,
    currency: 'USD',
    stock: 1,
    images: [],
    rating: 0,
    reviewCount: 0,
    category: 'cat',
    tags: [],
  };
}

const ids = () => useRecentlyViewedStore.getState().items.map((p) => p.id);

describe('recentlyViewedStore', () => {
  beforeEach(() => {
    useRecentlyViewedStore.setState({ items: [] });
    localStorage.clear();
  });

  it('prepends the most recently viewed product', () => {
    const { addProduct } = useRecentlyViewedStore.getState();
    addProduct(makeProduct('a'));
    addProduct(makeProduct('b'));

    expect(ids()).toEqual(['b', 'a']);
  });

  it('de-dupes by id, moving a re-viewed product to the front', () => {
    const { addProduct } = useRecentlyViewedStore.getState();
    addProduct(makeProduct('a'));
    addProduct(makeProduct('b'));
    addProduct(makeProduct('a'));

    expect(ids()).toEqual(['a', 'b']);
  });

  it(`caps the list at ${MAX_RECENTLY_VIEWED} items, newest first`, () => {
    const { addProduct } = useRecentlyViewedStore.getState();
    for (let i = 0; i < MAX_RECENTLY_VIEWED + 3; i += 1) {
      addProduct(makeProduct(`p${i}`));
    }

    const items = useRecentlyViewedStore.getState().items;
    expect(items).toHaveLength(MAX_RECENTLY_VIEWED);
    expect(items[0].id).toBe(`p${MAX_RECENTLY_VIEWED + 2}`);
  });
});
