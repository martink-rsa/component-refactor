export type Product = {
  id: string
  name: string
  sku: string
  description: string
  price: number
  salePrice?: number
  currency: string
  stock: number
  images: string[]
  rating: number
  reviewCount: number
  category: string
  tags: string[]
}

export type Review = {
  id: string
  author: string
  rating: number
  body: string
  createdAt: string
}

export type Recommendation = {
  id: string
  name: string
  price: number
  image: string
}

export type CartItem = {
  productId: string
  quantity: number
  selectedImage: string
}
