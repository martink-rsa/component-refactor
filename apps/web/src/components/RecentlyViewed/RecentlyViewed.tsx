import { useRecentlyViewedStore } from '@/stores';

/** Persistent list of products the user has recently viewed. */
export function RecentlyViewed() {
  const recentlyViewed = useRecentlyViewedStore((state) => state.items);

  return (
    <section style={{ marginTop: 48 }}>
      <h2>Recently viewed</h2>

      {recentlyViewed.map((item) => (
        <article key={item.id}>
          <h3>{item.name}</h3>
          <p>
            {item.currency} {item.price.toFixed(2)}
          </p>
        </article>
      ))}
    </section>
  );
}
