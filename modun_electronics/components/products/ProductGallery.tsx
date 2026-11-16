"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategorySlug, ProductImage } from "@/types/product";
import CategoryIcon from "./CategoryIcon";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  categorySlug: CategorySlug;
}

export default function ProductGallery({ images, title, categorySlug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-muted">
        <CategoryIcon slug={categorySlug} className="size-40 text-subtle" />
      </div>
    );
  }

  const active = images[activeIndex];
  const hasMultiple = images.length > 1;
  const altFor = (image: ProductImage, index: number) =>
    image.alt ?? `${title}, image ${index + 1} of ${images.length}`;
  const showImage = (index: number) =>
    setActiveIndex((index + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
        <Image
          key={active.url}
          src={active.url}
          alt={altFor(active, activeIndex)}
          fill
          preload={activeIndex === 0}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        {hasMultiple && (
          <>
            <GalleryArrow direction="previous" onClick={() => showImage(activeIndex - 1)} />
            <GalleryArrow direction="next" onClick={() => showImage(activeIndex + 1)} />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative aspect-square overflow-hidden rounded-xl bg-muted ring-offset-2 transition ${
                index === activeIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface GalleryArrowProps {
  direction: "previous" | "next";
  onClick: () => void;
}

function GalleryArrow({ direction, onClick }: GalleryArrowProps) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === "previous" ? "Previous" : "Next"} image`}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow transition hover:bg-white ${
        direction === "previous" ? "left-3" : "right-3"
      }`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
