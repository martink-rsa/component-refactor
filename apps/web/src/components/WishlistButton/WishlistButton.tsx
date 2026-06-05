import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { updateWishlist } from '@/api/wishlist';

/** Toggles the product's wishlist state optimistically and syncs the server. */
export function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setWishlisted] = useState(false);

  const { mutate } = useMutation({
    mutationFn: (wishlisted: boolean) => updateWishlist(productId, wishlisted),
    onError: () => {
      console.log('Wishlist request failed');
    },
  });

  function toggle() {
    // updateWishlist removes when `wishlisted` is true, so the pre-toggle
    // value is what tells the server which way to move.
    setWishlisted(!isWishlisted);
    mutate(isWishlisted);
  }

  return (
    <button onClick={toggle}>
      {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    </button>
  );
}
