export type CategorySlug =
  | "phones"
  | "laptops"
  | "tablets"
  | "audio"
  | "tvs-monitors"
  | "cameras"
  | "gaming"
  | "wearables"
  | "accessories";

export interface Category {
  slug: CategorySlug;
  name: string;
}

export interface Brand {
  slug: string;
  name: string;
}

export interface ProductVariant {
  sku: string;
  name: string;
  priceCents: number;
  compareAtCents?: number;
  stock: number;
  reserved: number;
  lowStockAt: number;
}

export interface ProductSpec {
  group?: string;
  key: string;
  label: string;
  value: string;
  unit?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  slug: string;
  title: string;
  description: string;
  categorySlug: CategorySlug;
  brand: Brand;
  warrantyMonths?: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  isFeatured?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  specs: ProductSpec[];
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
