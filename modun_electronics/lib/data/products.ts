import type { Category, CategorySlug, Product } from "@/types/product";
import { CATEGORIES, PRODUCTS } from "@/mock_data";

// Query layer over the mock catalog in `mock_data/`. Swap these for Prisma
// queries once Prisma + Neon are set up; callers stay the same.

export { CATEGORIES };

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getProducts(categorySlug?: CategorySlug): Product[] {
  if (!categorySlug) return PRODUCTS;
  return PRODUCTS.filter((product) => product.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return PRODUCTS.filter((product) => {
    const haystack = [
      product.title,
      product.brand.name,
      getCategory(product.categorySlug)?.name ?? "",
      ...product.specs.map((spec) => `${spec.label} ${spec.value} ${spec.unit ?? ""}`),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((product) => product.isFeatured);
}

export function getNewArrivals(limit = 4): Product[] {
  return [...PRODUCTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
