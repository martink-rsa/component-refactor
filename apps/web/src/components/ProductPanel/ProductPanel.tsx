import { useCartStore } from '@/stores';
import type { Product } from '@/types/product';

import { useProductUiStore } from '@/components/ProductPageClient/productUiStore';
import { StarRating } from '@/components/StarRating/StarRating';
import { ProductPrice } from '@/components/ProductPrice/ProductPrice';
import { CouponField } from '@/components/CouponField/CouponField';
import { DeliveryChecker } from '@/components/DeliveryChecker/DeliveryChecker';
import { WishlistButton } from '@/components/WishlistButton/WishlistButton';

/** Right-hand column: product summary plus the purchase controls. */
export function ProductPanel({ product }: { product: Product }) {
  const quantity = useProductUiStore((state) => state.quantity);
  const setQuantity = useProductUiStore((state) => state.setQuantity);
  const addItem = useCartStore((state) => state.addItem);

  function addToCart() {
    addItem({
      productId: product.id,
      quantity,
      selectedImage: product.images[0] ?? '',
    });
    alert('Added to cart');
  }

  return (
    <section style={{ width: '50%' }}>
      <p>{product.category}</p>
      <h1>{product.name}</h1>
      <p>SKU: {product.sku}</p>

      <div>
        <StarRating rating={product.rating} />
        <span> ({product.reviewCount} reviews)</span>
      </div>

      <ProductPrice product={product} />

      <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

      <div style={{ marginTop: 24 }}>
        <label>
          Quantity
          <input
            type="number"
            id="quantity"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(parseInt(event.target.value, 10))}
          />
        </label>
      </div>

      <CouponField />

      <DeliveryChecker productId={product.id} />

      <div style={{ marginTop: 24 }}>
        <button disabled={product.stock === 0} onClick={addToCart}>
          Add to cart
        </button>

        <WishlistButton productId={product.id} />
      </div>

      <div style={{ marginTop: 24 }}>
        <p>Tags:</p>
        {product.tags.map((tag) => (
          <span key={tag} style={{ marginRight: 8 }}>
            #{tag}
          </span>
        ))}
      </div>
    </section>
  );
}
