import { ReviewListSchema, type Review } from '@/types/product';
import { requestJson } from './client';

export function getReviews(productId: string, sort: string): Promise<Review[]> {
  return requestJson(
    `/api/products/${encodeURIComponent(productId)}/reviews?sort=${encodeURIComponent(sort)}`,
    ReviewListSchema,
  );
}
