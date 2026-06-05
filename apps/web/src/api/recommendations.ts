import { RecommendationListSchema, type Recommendation } from '@/types/product';
import { requestJson } from './client';

export function getRecommendations(
  productId: string,
  category: string,
): Promise<Recommendation[]> {
  return requestJson(
    `/api/recommendations?productId=${encodeURIComponent(productId)}&category=${encodeURIComponent(category)}`,
    RecommendationListSchema,
  );
}
