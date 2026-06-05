import { apiFetch } from './client'

export interface ProductViewEvent {
  productId: string
  name: string
  category: string
  viewedAt: string
}

export function postProductView(event: ProductViewEvent): Promise<Response> {
  return apiFetch('/api/analytics/product-view', {
    method: 'POST',
    body: JSON.stringify(event),
  })
}
