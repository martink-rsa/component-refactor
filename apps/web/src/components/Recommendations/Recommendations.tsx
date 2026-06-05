import { useQuery } from '@tanstack/react-query';

import { getRecommendations } from '@/api/recommendations';

/** "You may also like" grid of recommended products. */
export function Recommendations({
  productId,
  category,
  currency,
}: {
  productId: string;
  category: string;
  currency: string;
}) {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', productId, category],
    queryFn: () => getRecommendations(productId, category),
  });

  return (
    <section style={{ marginTop: 48 }}>
      <h2>You may also like</h2>

      {isLoading && <p>Loading recommendations...</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {recommendations.map((item) => (
          <article key={item.id}>
            <img src={item.image} alt={item.name} width={200} height={200} />
            <h3>{item.name}</h3>
            <p>
              {currency} {item.price.toFixed(2)}
            </p>
            <a href={`/products/${item.id}`}>View product</a>
          </article>
        ))}
      </div>
    </section>
  );
}
