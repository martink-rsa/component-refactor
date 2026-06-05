import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getProduct } from '@/api/products';
import { getReviews } from '@/api/reviews';
import { getRecommendations } from '@/api/recommendations';
import { getDeliveryEstimate } from '@/api/delivery';
import { postProductView } from '@/api/analytics';
import { updateWishlist } from '@/api/wishlist';
import { useCartStore, useRecentlyViewedStore } from '@/stores';

import { ProductUiStoreProvider } from './ProductUiStoreProvider';
import { useProductUiStore, type ReviewSort } from './productUiStore';

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
  const selectedImage = useProductUiStore((state) => state.selectedImage);
  const setSelectedImage = useProductUiStore((state) => state.setSelectedImage);
  const quantity = useProductUiStore((state) => state.quantity);
  const setQuantity = useProductUiStore((state) => state.setQuantity);
  const postcode = useProductUiStore((state) => state.postcode);
  const setPostcode = useProductUiStore((state) => state.setPostcode);
  const couponCode = useProductUiStore((state) => state.couponCode);
  const setCouponCode = useProductUiStore((state) => state.setCouponCode);
  const couponMessage = useProductUiStore((state) => state.couponMessage);
  const applyCoupon = useProductUiStore((state) => state.applyCoupon);
  const discount = useProductUiStore((state) => state.discount);
  const isWishlisted = useProductUiStore((state) => state.isWishlisted);
  const setWishlisted = useProductUiStore((state) => state.setWishlisted);
  const sortReviewsBy = useProductUiStore((state) => state.sortReviewsBy);
  const setSortReviewsBy = useProductUiStore((state) => state.setSortReviewsBy);
  const activeTab = useProductUiStore((state) => state.activeTab);
  const setActiveTab = useProductUiStore((state) => state.setActiveTab);

  const addItem = useCartStore((state) => state.addItem);
  const recentlyViewed = useRecentlyViewedStore((state) => state.items);
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  const {
    data: product,
    isLoading: loadingProduct,
    isError,
  } = useQuery({
    queryKey: ['product', productId, quantity],
    queryFn: () => getProduct(productId, quantity),
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', productId, sortReviewsBy],
    queryFn: () => getReviews(productId, sortReviewsBy),
  });

  const { data: recommendations = [], isLoading: loadingRecommendations } =
    useQuery({
      queryKey: ['recommendations', productId, product?.category],
      queryFn: () => getRecommendations(productId, product?.category ?? ''),
      enabled: !!product,
    });

  const deliveryQuery = useQuery({
    queryKey: ['delivery', productId, postcode],
    queryFn: () => getDeliveryEstimate(productId, postcode),
    enabled: !!postcode,
  });

  const { mutate: trackProductView } = useMutation({
    mutationFn: postProductView,
  });

  const { mutate: mutateWishlist } = useMutation({
    mutationFn: (wishlisted: boolean) =>
      updateWishlist(product!.id, wishlisted),
    onError: () => {
      console.log('Wishlist request failed');
    },
  });

  const currentImage = selectedImage || product?.images?.[0] || '';

  const deliveryMessage = !postcode
    ? ''
    : deliveryQuery.isError
      ? 'Could not check delivery right now'
      : deliveryQuery.data
        ? `Delivery available in ${deliveryQuery.data.days} days`
        : '';

  const finalPrice = useMemo(() => {
    if (!product) return 0;

    const basePrice = product.salePrice || product.price;
    return basePrice - basePrice * discount;
  }, [product, discount]);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product, addProduct]);

  const analyticsSentFor = useRef<string | null>(null);

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

  function addToCart() {
    if (!product) return;

    addItem({
      productId: product.id,
      quantity,
      selectedImage: currentImage,
    });

    alert('Added to cart');
  }

  function toggleWishlist() {
    if (!product) return;

    setWishlisted(!isWishlisted);
    mutateWishlist(isWishlisted);
  }

  function renderStars(rating: number) {
    const rounded = Math.round(rating);

    return (
      <span aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
    );
  }

  if (loadingProduct) {
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
        <section style={{ width: '50%' }}>
          <div>
            <img
              src={currentImage}
              alt={product.name}
              width={600}
              height={600}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {product.images.map((image) => (
              <button
                key={image}
                onClick={() => setSelectedImage(image)}
                style={{
                  border:
                    image === currentImage
                      ? '2px solid black'
                      : '1px solid #ccc',
                }}
              >
                <img src={image} alt="" width={80} height={80} />
              </button>
            ))}
          </div>
        </section>

        <section style={{ width: '50%' }}>
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <p>SKU: {product.sku}</p>

          <div>
            {renderStars(product.rating)}
            <span> ({product.reviewCount} reviews)</span>
          </div>

          <div style={{ marginTop: 24 }}>
            {product.salePrice ? (
              <>
                <p style={{ textDecoration: 'line-through' }}>
                  {product.currency} {product.price.toFixed(2)}
                </p>
                <p style={{ fontSize: 28 }}>
                  {product.currency} {finalPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 28 }}>
                {product.currency} {finalPrice.toFixed(2)}
              </p>
            )}
          </div>

          <p>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div style={{ marginTop: 24 }}>
            <label>
              Quantity
              <input
                type="number"
                id="quantity"
                min={1}
                value={quantity}
                onChange={(event) =>
                  setQuantity(parseInt(event.target.value, 10))
                }
              />
            </label>
          </div>

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

          <div style={{ marginTop: 24 }}>
            <label>
              Check delivery
              <input
                value={postcode}
                onChange={(event) => setPostcode(event.target.value)}
                placeholder="Postcode"
              />
            </label>
            <p>{deliveryMessage}</p>
          </div>

          <div style={{ marginTop: 24 }}>
            <button disabled={product.stock === 0} onClick={addToCart}>
              Add to cart
            </button>

            <button onClick={toggleWishlist}>
              {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            </button>
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
      </div>

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

        {activeTab === 'reviews' && (
          <div>
            <h2>Reviews</h2>

            <label>
              Sort by
              <select
                value={sortReviewsBy}
                onChange={(event) =>
                  setSortReviewsBy(event.target.value as ReviewSort)
                }
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>

            {loadingReviews && <p>Loading reviews...</p>}

            {!loadingReviews &&
              reviews.map((review) => (
                <article
                  key={review.id}
                  style={{ borderTop: '1px solid #ddd' }}
                >
                  <h3>{review.author}</h3>
                  {renderStars(review.rating)}
                  <p>{review.body}</p>
                  <small>{review.createdAt}</small>
                </article>
              ))}
          </div>
        )}

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

      <section style={{ marginTop: 48 }}>
        <h2>You may also like</h2>

        {loadingRecommendations && <p>Loading recommendations...</p>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {recommendations.map((item) => (
            <article key={item.id}>
              <img src={item.image} alt={item.name} width={200} height={200} />
              <h3>{item.name}</h3>
              <p>
                {product.currency} {item.price.toFixed(2)}
              </p>
              <a href={`/products/${item.id}`}>View product</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2>Recently viewed</h2>

        {recentlyViewed.map((item) => (
          <article key={item.id}>
            <h3>{item.name}</h3>
            <p>
              {item.currency} {item.price.toFixed(2)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
