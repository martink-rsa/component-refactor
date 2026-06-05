import { z } from 'zod';

import { requestJson } from './client';

export const DeliveryEstimateSchema = z.object({
  days: z.number(),
});
export type DeliveryEstimate = z.infer<typeof DeliveryEstimateSchema>;

export function getDeliveryEstimate(
  productId: string,
  postcode: string,
): Promise<DeliveryEstimate> {
  return requestJson(
    `/api/delivery/estimate?postcode=${encodeURIComponent(postcode)}&productId=${encodeURIComponent(productId)}`,
    DeliveryEstimateSchema,
  );
}
