import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getReviews } from '@/api/reviews';

import { StarRating } from '@/components/StarRating/StarRating';

export type ReviewSort = 'newest' | 'highest' | 'lowest';

/** Sortable list of product reviews. */
export function ReviewsTab({ productId }: { productId: string }) {
  const [sortReviewsBy, setSortReviewsBy] = useState<ReviewSort>('newest');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId, sortReviewsBy],
    queryFn: () => getReviews(productId, sortReviewsBy),
  });

  return (
    <div>
      <h2>Reviews</h2>

      <label>
        Sort by
        <select
          value={sortReviewsBy}
          onChange={(event) =>
            setSortReviewsBy(event.target.value as ReviewSort)
          }
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </label>

      {isLoading && <p>Loading reviews...</p>}

      {!isLoading &&
        reviews.map((review) => (
          <article key={review.id} style={{ borderTop: '1px solid #ddd' }}>
            <h3>{review.author}</h3>
            <StarRating rating={review.rating} />
            <p>{review.body}</p>
            <small>{review.createdAt}</small>
          </article>
        ))}
    </div>
  );
}
