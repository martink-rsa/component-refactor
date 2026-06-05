import { useQuery } from '@tanstack/react-query';

import { getProduct } from '@/api/products';

import { ProductUiStoreProvider } from './ProductUiStoreProvider';
import { useProductUiStore } from './productUiStore';
import { useRecordProductView } from './useRecordProductView';
import { ProductGallery } from '@/components/ProductGallery/ProductGallery';
import { ProductPanel } from '@/components/ProductPanel/ProductPanel';
import { ProductTabs } from '@/components/ProductTabs/ProductTabs';
import { Recommendations } from '@/components/Recommendations/Recommendations';
import { RecentlyViewed } from '@/components/RecentlyViewed/RecentlyViewed';

export default function ProductPageClient({
  productId,
}: {
  productId: string;
}) {
  return (
    <ProductUiStoreProvider key={productId}>
      <ProductPageView productId={productId} />
    </ProductUiStoreProvider>
  );
}

function ProductPageView({ productId }: { productId: string }) {
  const quantity = useProductUiStore((state) => state.quantity);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', productId, quantity],
    queryFn: () => getProduct(productId, quantity),
  });

  useRecordProductView(product);

  if (isLoading) {
    return (
      <main style={{ padding: 32 }}>
        <p>Loading product...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>Could not load product</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: 32 }}>
        <p>No product found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <div style={{ display: 'flex', gap: 32 }}>
        <ProductGallery product={product} />
        <ProductPanel product={product} />
      </div>

      <ProductTabs product={product} />

      <Recommendations
        productId={product.id}
        category={product.category}
        currency={product.currency}
      />

      <RecentlyViewed />
    </main>
  );
}
