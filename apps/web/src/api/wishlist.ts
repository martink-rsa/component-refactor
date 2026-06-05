import { apiFetch } from './client';

export function updateWishlist(
  productId: string,
  wishlisted: boolean,
): Promise<Response> {
  return apiFetch('/api/wishlist', {
    method: wishlisted ? 'DELETE' : 'POST',
    body: JSON.stringify({ productId }),
  });
}
