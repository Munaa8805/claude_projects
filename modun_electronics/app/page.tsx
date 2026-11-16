import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, getFeaturedProducts, getNewArrivals } from "@/lib/data/products";
import CategoryIcon from "@/components/products/CategoryIcon";
import ProductGrid from "@/components/products/ProductGrid";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  return (
    <div className="flex flex-col gap-14">
      <section className="rounded-3xl bg-gradient-to-br from-primary to-indigo-700 px-6 py-14 text-primary-foreground sm:px-12">
        <p className="text-sm font-medium uppercase tracking-widest opacity-80">New season tech</p>
        <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
          The latest electronics, in stock and ready to ship.
        </h1>
        <p className="mt-4 max-w-lg opacity-90">
          Compare specs, check real-time stock and get your next phone, laptop or headphones
          delivered fast.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-primary transition hover:bg-white/90"
        >
          Shop all products
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold">Shop by category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <CategoryIcon slug={category.slug} className="size-7" />
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Featured" />
        <ProductGrid products={featured} />
      </section>

      <section>
        <SectionHeading title="New arrivals" />
        <ProductGrid products={newArrivals} />
      </section>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <Link href="/products" className="text-sm font-medium text-primary hover:underline">
        View all
      </Link>
    </div>
  );
}
