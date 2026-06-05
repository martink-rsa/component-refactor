import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { postProductView } from '@/api/analytics';
import { useRecentlyViewedStore } from '@/stores';
import type { Product } from '@/types/product';

/**
 * Records a product view once it has loaded: adds it to the recently-viewed
 * list and fires a one-off analytics event, guarded so re-renders for the same
 * product id don't double-count.
 */
export function useRecordProductView(product: Product | undefined) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);
  const { mutate: trackProductView } = useMutation({
    mutationFn: postProductView,
  });
  const analyticsSentFor = useRef<string | null>(null);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product, addProduct]);

  useEffect(() => {
    if (!product || analyticsSentFor.current === product.id) return;

    analyticsSentFor.current = product.id;

    trackProductView({
      productId: product.id,
      name: product.name,
      category: product.category,
      viewedAt: new Date().toISOString(),
    });
  }, [product, trackProductView]);
}
