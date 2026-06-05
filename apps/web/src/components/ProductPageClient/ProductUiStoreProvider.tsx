import { useState, type ReactNode } from 'react';

import { createProductUiStore, ProductUiStoreContext } from './productUiStore';

/**
 * Provides a fresh, isolated product UI store to its subtree. Mount one per
 * product (e.g. keyed on productId) so the contained view state resets cleanly
 * between products.
 */
export function ProductUiStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProductUiStore());

  return (
    <ProductUiStoreContext.Provider value={store}>
      {children}
    </ProductUiStoreContext.Provider>
  );
}
