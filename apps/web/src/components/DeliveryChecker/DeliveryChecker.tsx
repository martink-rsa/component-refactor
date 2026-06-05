import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getDeliveryEstimate } from '@/api/delivery';

/** Postcode input that estimates delivery time for the product. */
export function DeliveryChecker({ productId }: { productId: string }) {
  const [postcode, setPostcode] = useState('');

  const { data, isError } = useQuery({
    queryKey: ['delivery', productId, postcode],
    queryFn: () => getDeliveryEstimate(productId, postcode),
    enabled: !!postcode,
  });

  const message = !postcode
    ? ''
    : isError
      ? 'Could not check delivery right now'
      : data
        ? `Delivery available in ${data.days} days`
        : '';

  return (
    <div style={{ marginTop: 24 }}>
      <label>
        Check delivery
        <input
          value={postcode}
          onChange={(event) => setPostcode(event.target.value)}
          placeholder="Postcode"
        />
      </label>
      <p>{message}</p>
    </div>
  );
}
