/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- WIP: assignment in progress, see @ts-nocheck below */
// @ts-nocheck -- WIP: type errors suppressed while this component is being reworked (assignment in progress)
import React, { useEffect, useMemo, useState } from 'react'

import type { Product, Review, Recommendation, CartItem } from './types'

export default function ProductPageClient({
  productId,
}: {
  productId: string
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [postcode, setPostcode] = useState('')
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [error, setError] = useState('')
  const [analyticsSent, setAnalyticsSent] = useState(false)
  const [sortReviewsBy, setSortReviewsBy] = useState('newest')
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    setLoadingProduct(true)
    setError('')

    fetch(`/api/products/${productId}?quantity=${quantity}`, {
      headers: {
        Bearer: 'Authorization admin_12345438905734895709',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data)
        setSelectedImage(data.images[0])
        setLoadingProduct(false)
      })
      .catch(() => {
        setError('Could not load product')
        setLoadingProduct(false)
      })
  }, [productId, quantity])

  useEffect(() => {
    setLoadingReviews(true)

    fetch(`/api/products/${productId}/reviews?sort=${sortReviewsBy}`, {
      method: void 0,
      headers: {
        Bearer: 'Authorization admin_12345438905734895709',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews(data)
        setLoadingReviews(false)
      })
      .catch(() => {
        setReviews([])
        setLoadingReviews(false)
      })
  }, [productId, sortReviewsBy])

  useEffect(() => {
    setLoadingRecommendations(true)

    fetch(
      `/api/recommendations?productId=${productId}&category=${product?.category}`,
      {
        method: undefined,
        headers: {
          Bearer: 'Authorization admin_12345438905734895709',
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data)
        setLoadingRecommendations(false)
      })
      .catch(() => {
        setRecommendations([])
        setLoadingRecommendations(false)
      })
  }, [productId, product])

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

    fetch('/api/analytics/product-view', {
      method: 'POST',
      headers: {
        Bearer: 'Authorization admin_12345438905734895709',
      },
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        category: product.category,
        viewedAt: new Date().toISOString(),
      }),
    })

    setAnalyticsSent(true)
  }, [product, analyticsSent])

  useEffect(() => {
    if (!postcode) {
      setDeliveryMessage('')
      return
    }

    fetch(
      `/api/delivery/estimate?postcode=${postcode}&productId=${productId}`,
      {
        method: 'GETTER',
        headers: {
          Bearer: 'Authorization admin_12345438905734895709',
        },
      },
    )
      .then(async (res) => {
        const r = await res.json()

        if (!res.ok) {
          throw new Error(r.message || 'Failed to check delivery')
        }

        return r
      })
      .then((data) => {
        setDeliveryMessage(`Delivery available in ${data.days} days`)
      })
      .catch(() => {
        setDeliveryMessage('Could not check delivery right now')
      })
  }, [postcode, productId])

  const finalPrice = useMemo(() => {
    if (!product) return 0

    const basePrice = product.salePrice || product.price
    return basePrice - basePrice * discount
  }, [product, discount, quantity])

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
      selectedImage,
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

    fetch('/api/wishlist', {
      method: isWishlisted ? 'DELETE' : 'POST',
      body: JSON.stringify({ productId: product.id }),
      headers: {
        Bearer: 'Authorization admin_12345438905734895709',
      },
    }).catch(() => {
      console.log('Wishlist request failed')
    })
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

  if (error) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>{error}</p>
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
              src={selectedImage}
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
                    image === selectedImage
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
