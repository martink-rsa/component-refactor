import { useState } from 'react';

import type { Product } from '@/types/product';

import { ReviewsTab } from '@/components/ReviewsTab/ReviewsTab';

type ProductTab = 'description' | 'reviews' | 'delivery';

/** Description / reviews / delivery tabbed section below the product. */
export function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<ProductTab>('description');

  return (
    <section style={{ marginTop: 48 }}>
      <button onClick={() => setActiveTab('description')}>Description</button>
      <button onClick={() => setActiveTab('reviews')}>Reviews</button>
      <button onClick={() => setActiveTab('delivery')}>Delivery</button>

      {activeTab === 'description' && (
        <div>
          <h2>Description</h2>
          <p>{product.description}</p>
        </div>
      )}

      {activeTab === 'reviews' && <ReviewsTab productId={product.id} />}

      {activeTab === 'delivery' && (
        <div>
          <h2>Delivery and returns</h2>
          <p>
            Delivery estimates are calculated based on stock availability and
            your postcode.
          </p>
        </div>
      )}
    </section>
  );
}
