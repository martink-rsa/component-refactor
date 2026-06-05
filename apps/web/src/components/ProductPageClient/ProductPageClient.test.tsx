import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductPageClient from './ProductPageClient';

// Keep the product query pending so the loading state is asserted
// deterministically; the rest of the API surface is stubbed out.
vi.mock('@/api/products', () => ({
  getProduct: () => new Promise(() => {}),
}));
vi.mock('@/api/reviews', () => ({ getReviews: () => Promise.resolve([]) }));
vi.mock('@/api/recommendations', () => ({
  getRecommendations: () => Promise.resolve([]),
}));
vi.mock('@/api/delivery', () => ({
  getDeliveryEstimate: () => Promise.resolve({ days: 1 }),
}));
vi.mock('@/api/analytics', () => ({
  postProductView: () => Promise.resolve(new Response()),
}));
vi.mock('@/api/wishlist', () => ({
  updateWishlist: () => Promise.resolve(new Response()),
}));

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('ProductPageClient', () => {
  it('renders the loading state while the product query is pending', () => {
    renderWithClient(<ProductPageClient productId="p1" />);

    expect(screen.getByText('Loading product...')).toBeInTheDocument();
  });
});
