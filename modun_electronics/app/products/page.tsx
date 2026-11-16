import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES, getCategory, getProducts } from "@/lib/data/products";
import ProductGrid from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      <Suspense fallback={<ProductsSkeleton />}>
        <FilteredProducts searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

interface FilteredProductsProps {
  searchParams: PageProps<"/products">["searchParams"];
}

async function FilteredProducts({ searchParams }: FilteredProductsProps) {
  const { category: categoryParam } = await searchParams;
  const category = typeof categoryParam === "string" ? getCategory(categoryParam) : undefined;
  const products = getProducts(category?.slug);

  return (
    <>
      <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip href="/products" label="All" active={!category} />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.slug}
            href={`/products?category=${c.slug}`}
            label={c.name}
            active={category?.slug === c.slug}
          />
        ))}
      </nav>
      <p className="text-sm text-subtle">
        {products.length} {products.length === 1 ? "product" : "products"}
        {category && ` in ${category.name}`}
      </p>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-subtle">
          No products in this category yet.
        </p>
      )}
    </>
  );
}

interface FilterChipProps {
  href: string;
  label: string;
  active: boolean;
}

function FilterChip({ href, label, active }: FilterChipProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-subtle hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[3/4] rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
