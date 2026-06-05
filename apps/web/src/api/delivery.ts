import { apiFetch } from './client';

export interface DeliveryEstimate {
  days: number;
}

export async function getDeliveryEstimate(
  productId: string,
  postcode: string,
): Promise<DeliveryEstimate> {
  const res = await apiFetch(
    `/api/delivery/estimate?postcode=${postcode}&productId=${productId}`,
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to check delivery');
  }

  return data;
}
