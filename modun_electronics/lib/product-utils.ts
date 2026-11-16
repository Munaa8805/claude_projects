import type { Product, ProductVariant, StockStatus } from "@/types/product";

const PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(cents: number): string {
  return PRICE_FORMATTER.format(cents / 100);
}

export function getAvailableStock(variant: ProductVariant): number {
  return Math.max(variant.stock - variant.reserved, 0);
}

export function getStockStatus(variant: ProductVariant): StockStatus {
  const available = getAvailableStock(variant);
  if (available === 0) return "out-of-stock";
  if (available <= variant.lowStockAt) return "low-stock";
  return "in-stock";
}

export function getStartingPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.priceCents));
}

export function isOnSale(product: Product): boolean {
  return product.variants.some(
    (variant) => variant.compareAtCents && variant.compareAtCents > variant.priceCents,
  );
}

export function isProductInStock(product: Product): boolean {
  return product.variants.some((variant) => getAvailableStock(variant) > 0);
}
