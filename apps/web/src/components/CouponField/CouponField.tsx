import { useProductUiStore } from '@/components/ProductPageClient/productUiStore';

/** Coupon code input that applies a discount to the product price. */
export function CouponField() {
  const couponCode = useProductUiStore((state) => state.couponCode);
  const setCouponCode = useProductUiStore((state) => state.setCouponCode);
  const couponMessage = useProductUiStore((state) => state.couponMessage);
  const applyCoupon = useProductUiStore((state) => state.applyCoupon);

  return (
    <div style={{ marginTop: 24 }}>
      <label>
        Coupon
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="Enter coupon"
        />
      </label>
      <button onClick={applyCoupon}>Apply</button>
      <p>{couponMessage}</p>
    </div>
  );
}
