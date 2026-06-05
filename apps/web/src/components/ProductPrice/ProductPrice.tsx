import type { Product } from '@/types/product';

import { useProductUiStore } from '@/components/ProductPageClient/productUiStore';

/**
 * Product price with the applied coupon discount. When the product is on sale
 * the original price is shown struck through above the discounted price.
 */
export function ProductPrice({ product }: { product: Product }) {
  const discount = useProductUiStore((state) => state.discount);

  const basePrice = product.salePrice || product.price;
  const finalPrice = basePrice - basePrice * discount;

  const format = (value: number) => `${product.currency} ${value.toFixed(2)}`;

  return (
    <div style={{ marginTop: 24 }}>
      {product.salePrice ? (
        <p style={{ textDecoration: 'line-through' }}>
          {format(product.price)}
        </p>
      ) : null}
      <p style={{ fontSize: 28 }}>{format(finalPrice)}</p>
    </div>
  );
}
