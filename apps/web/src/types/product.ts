import { z } from 'zod';

/**
 * Schemas are the source of truth for everything that crosses the network
 * boundary. The TypeScript types are derived from them with `z.infer`, so the
 * compile-time shape and the runtime check can never drift apart. The API
 * services validate responses against these before handing data to the app.
 */

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  description: z.string(),
  price: z.number(),
  salePrice: z.number().optional(),
  currency: z.string(),
  stock: z.number(),
  images: z.array(z.string()),
  rating: z.number(),
  reviewCount: z.number(),
  category: z.string(),
  tags: z.array(z.string()),
});
export type Product = z.infer<typeof ProductSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number(),
  body: z.string(),
  createdAt: z.string(),
});
export const ReviewListSchema = z.array(ReviewSchema);
export type Review = z.infer<typeof ReviewSchema>;

export const RecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
});
export const RecommendationListSchema = z.array(RecommendationSchema);
export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Internal client-side cart state — constructed by the app, never received from
 * the API, so it stays a plain type with no runtime schema.
 */
export type CartItem = {
  productId: string;
  quantity: number;
  selectedImage: string;
};
