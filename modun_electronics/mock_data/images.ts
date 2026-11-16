import type { ProductImage } from "@/types/product";

// Unsplash stock photos stand in for real product shots until R2 uploads exist.
export function unsplashImages(photoIds: string[]): ProductImage[] {
  return photoIds.map((id) => ({
    url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`,
  }));
}
