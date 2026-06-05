import { ProductSchema, type Product } from '@/types/product';
import { requestJson } from './client';

export function getProduct(
  productId: string,
  quantity: number,
): Promise<Product> {
  return requestJson(
    `/api/products/${encodeURIComponent(productId)}?quantity=${quantity}`,
    ProductSchema,
  );
}
