/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- WIP: assignment in progress, see @ts-nocheck below */
// @ts-nocheck -- WIP: type errors suppressed while this component is being reworked (assignment in progress)
import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getProduct } from '@/api/products'
import { getReviews } from '@/api/reviews'
import { getRecommendations } from '@/api/recommendations'
import { getDeliveryEstimate } from '@/api/delivery'
import { postProductView } from '@/api/analytics'
import { updateWishlist } from '@/api/wishlist'
import type { Product, CartItem } from './types'

export default function ProductPageClient({
  productId,
}: {
  productId: string
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [postcode, setPostcode] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [analyticsSent, setAnalyticsSent] = useState(false)
  const [sortReviewsBy, setSortReviewsBy] = useState('newest')
  const [activeTab, setActiveTab] = useState('description')

  const {
    data: product,
    isLoading: loadingProduct,
    isError,
  } = useQuery({
    queryKey: ['product', productId, quantity],
    queryFn: () => getProduct(productId, quantity),
  })

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', productId, sortReviewsBy],
    queryFn: () => getReviews(productId, sortReviewsBy),
  })

  const { data: recommendations = [], isLoading: loadingRecommendations } =
    useQuery({
      queryKey: ['recommendations', productId, product?.category],
      queryFn: () => getRecommendations(productId, product?.category),
      enabled: !!product,
    })

  const deliveryQuery = useQuery({
    queryKey: ['delivery', productId, postcode],
    queryFn: () => getDeliveryEstimate(productId, postcode),
    enabled: !!postcode,
  })

  const analyticsMutation = useMutation({
    mutationFn: postProductView,
  })

  const wishlistMutation = useMutation({
    mutationFn: (wishlisted: boolean) => updateWishlist(product.id, wishlisted),
    onError: () => {
      console.log('Wishlist request failed')
    },
  })

  const currentImage = selectedImage || product?.images?.[0] || ''

  const deliveryMessage = !postcode
    ? ''
    : deliveryQuery.isError
      ? 'Could not check delivery right now'
      : deliveryQuery.data
        ? `Delivery available in ${deliveryQuery.data.days} days`
        : ''

  const finalPrice = useMemo(() => {
    if (!product) return 0

    const basePrice = product.salePrice || product.price
    return basePrice - basePrice * discount
  }, [product, discount, quantity])

  useEffect(() => {
    if (!product) return

    const next = [product, ...recentlyViewed].slice(0, 5)
    setRecentlyViewed(next)
    localStorage.setItem('recentlyViewed', JSON.stringify(next))
  }, [product, recentlyViewed])

  useEffect(() => {
    const saved = localStorage.getItem('cart')

    if (saved) {
      setCart(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!product || analyticsSent) return

    analyticsMutation.mutate({
      productId: product.id,
      name: product.name,
      category: product.category,
      viewedAt: new Date().toISOString(),
    })

    setAnalyticsSent(true)
  }, [product, analyticsSent])

  useEffect(() => {
    const quantityInput = document.getElementById('quantity')

    quantityInput?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement
      const value = parseInt(target.value, 10)

      setQuantity(Number(isNaN(value) || value < 1 ? 1 : value))
    })
  }, [])

  function addToCart() {
    if (!product) return

    const newItem = {
      productId: product.id,
      quantity,
      selectedImage: currentImage,
    }

    setCart([...cart, newItem])

    localStorage.setItem('cart', JSON.stringify([...cart, newItem]))

    alert('Added to cart')
  }

  function apply() {
    if (couponCode === 'WELCOME10') {
      setDiscount(1)
      setCouponMessage('Coupon applied')
      return
    }

    if (couponCode === 'SAVE20') {
      setDiscount(0.2)
      setCouponMessage('Coupon applied')
      return
    }

    if (couponCode.trim().length === 0) {
      setCouponMessage('Enter a coupon code')
      return
    }

    setDiscount(0)
    setCouponMessage('Invalid coupon')
  }

  function toggle() {
    if (!product) return

    setIsWishlisted(!isWishlisted)

    wishlistMutation.mutate(isWishlisted)
  }

  function renderStars(rating: number) {
    const rounded = Math.round(rating)

    return (
      <span aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
    )
  }

  if (loadingProduct) {
    return (
      <main style={{ padding: 32 }}>
        <p>Loading product...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>Could not load product</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </main>
    )
  }

  if (!product) {
    return (
      <main style={{ padding: 32 }}>
        <p>No product found.</p>
      </main>
    )
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
                <Image src={image} alt="" width={80} height={80} />
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
              <input type="number" value={quantity} id="quantity" min={1} />
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
            <button onClick={apply}>Apply</button>
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

            <button onClick={toggle}>
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
                onChange={(event) => setSortReviewsBy(event.target.value)}
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
  )
}
