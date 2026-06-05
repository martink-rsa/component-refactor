import type { Review } from '@/components/ProductPageClient/types'
import { apiFetch } from './client'

export async function getReviews(
  productId: string,
  sort: string,
): Promise<Review[]> {
  const res = await apiFetch(`/api/products/${productId}/reviews?sort=${sort}`)

  return res.json()
}
