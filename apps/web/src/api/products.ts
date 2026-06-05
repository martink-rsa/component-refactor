import type { Product } from '@/components/ProductPageClient/types'
import { apiFetch } from './client'

export async function getProduct(
  productId: string,
  quantity: number,
): Promise<Product> {
  const res = await apiFetch(`/api/products/${productId}?quantity=${quantity}`)

  return res.json()
}
