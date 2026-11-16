"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types/product";
import { formatPrice, getAvailableStock, getStockStatus } from "@/lib/product-utils";
import StockBadge from "./StockBadge";

interface VariantPickerProps {
  variants: ProductVariant[];
}

export default function VariantPicker({ variants }: VariantPickerProps) {
  const firstAvailable = variants.find((v) => getAvailableStock(v) > 0) ?? variants[0];
  const [selectedSku, setSelectedSku] = useState(firstAvailable.sku);
  const selected = variants.find((v) => v.sku === selectedSku) ?? firstAvailable;
  const onSale = selected.compareAtCents !== undefined && selected.compareAtCents > selected.priceCents;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-3xl font-bold">{formatPrice(selected.priceCents)}</p>
        {onSale && selected.compareAtCents !== undefined && (
          <p className="text-lg text-subtle line-through">{formatPrice(selected.compareAtCents)}</p>
        )}
      </div>

      <StockBadge status={getStockStatus(selected)} available={getAvailableStock(selected)} />

      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Choose an option</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.sku === selected.sku;
              const isOut = getAvailableStock(variant) === 0;
              return (
                <button
                  key={variant.sku}
                  type="button"
                  onClick={() => setSelectedSku(variant.sku)}
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border bg-surface hover:border-primary"
                  } ${isOut ? "text-subtle line-through" : ""}`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-xs text-subtle">SKU: {selected.sku}</p>
    </div>
  );
}
