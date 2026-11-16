import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, ShieldCheck, Star } from "lucide-react";
import { getCategory, getProductBySlug, getProducts } from "@/lib/data/products";
import type { ProductSpec } from "@/types/product";
import ProductGallery from "@/components/products/ProductGallery";
import VariantPicker from "@/components/products/VariantPicker";

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default function ProductDetailPage(props: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetails params={props.params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/p/[slug]">, "params">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);

  return (
    <div className="flex flex-col gap-10">
      <Link
        href={`/products?category=${product.categorySlug}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-subtle hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {category?.name ?? "Products"}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images}
          title={product.title}
          categorySlug={product.categorySlug}
        />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-subtle">{product.brand.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-sm text-subtle">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-medium text-foreground">{product.ratingAvg.toFixed(1)}</span>
              <span>· {product.ratingCount} reviews</span>
            </div>
          </div>

          <VariantPicker variants={product.variants} />

          <p className="leading-relaxed text-subtle">{product.description}</p>

          {product.warrantyMonths && (
            <p className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-in-stock" aria-hidden="true" />
              {product.warrantyMonths}-month warranty
            </p>
          )}
        </div>
      </div>

      <SpecsTable specs={product.specs} />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-10" aria-label="Loading product">
      <div className="h-5 w-24 rounded bg-muted" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-muted" />
        <div className="flex flex-col gap-6">
          <div className="h-24 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  );
}

function SpecsTable({ specs }: { specs: ProductSpec[] }) {
  const groups = Map.groupBy(specs, (spec) => spec.group ?? "General");

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Specifications</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {[...groups].map(([group, groupSpecs]) => (
          <div key={group} className="border-b border-border last:border-b-0">
            <h3 className="bg-muted px-4 py-2 text-sm font-semibold">{group}</h3>
            <dl className="divide-y divide-border">
              {groupSpecs.map((spec) => (
                <div key={spec.key} className="grid grid-cols-2 px-4 py-3 text-sm">
                  <dt className="text-subtle">{spec.label}</dt>
                  <dd className="font-medium">
                    {spec.value}
                    {spec.unit && ` ${spec.unit}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
