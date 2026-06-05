import { requestVoid } from './client';

export function updateWishlist(
  productId: string,
  wishlisted: boolean,
): Promise<void> {
  return requestVoid('/api/wishlist', {
    method: wishlisted ? 'DELETE' : 'POST',
    body: JSON.stringify({ productId }),
  });
}
