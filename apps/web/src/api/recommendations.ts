import type { Recommendation } from '@/components/ProductPageClient/types'
import { apiFetch } from './client'

export async function getRecommendations(
  productId: string,
  category: string,
): Promise<Recommendation[]> {
  const res = await apiFetch(
    `/api/recommendations?productId=${productId}&category=${category}`,
  )

  return res.json()
}
