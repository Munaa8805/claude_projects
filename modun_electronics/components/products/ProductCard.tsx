import Image from "next/image";
import Link from "next/link";
import { Star, Tag } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice, getStartingPrice, isOnSale, isProductInStock } from "@/lib/product-utils";
import CategoryIcon from "./CategoryIcon";

interface ProductCardProps {
  product: Product;
}

const CARD_IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export default function ProductCard({ product }: ProductCardProps) {
  const onSale = isOnSale(product);
  const inStock = isProductInStock(product);
  const hasMultiplePrices = new Set(product.variants.map((v) => v.priceCents)).size > 1;
  const [primaryImage, hoverImage] = product.images;

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.title}
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt=""
                fill
                sizes={CARD_IMAGE_SIZES}
                className="object-cover opacity-0 transition duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <CategoryIcon slug={product.categorySlug} className="size-20 text-subtle" />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-sale px-2 py-0.5 text-xs font-medium text-white">
            <Tag className="size-3" aria-hidden="true" />
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-subtle">{product.brand.name}</p>
        <h3 className="font-medium text-foreground">{product.title}</h3>
        <div className="flex items-center gap-1 text-sm text-subtle">
          <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{product.ratingAvg.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <p className="font-semibold text-foreground">
            {hasMultiplePrices && <span className="text-sm font-normal text-subtle">From </span>}
            {formatPrice(getStartingPrice(product))}
          </p>
          {!inStock && <span className="text-xs font-medium text-out-of-stock">Out of stock</span>}
        </div>
      </div>
    </Link>
  );
}
