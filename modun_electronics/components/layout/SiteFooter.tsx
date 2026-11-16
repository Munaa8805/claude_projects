import Link from "next/link";
import { Zap } from "lucide-react";
import { CATEGORIES } from "@/lib/data/products";

interface FooterLink {
  label: string;
  href: string;
}

const SHOP_LINKS: FooterLink[] = [
  { label: "All products", href: "/products" }
];

const ACCOUNT_LINKS: FooterLink[] = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Create account", href: "/sign-up" },
];

const CATEGORY_LINKS: FooterLink[] = CATEGORIES.map((category) => ({
  label: category.name,
  href: `/products?category=${category.slug}`,
}));

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Zap className="size-5 text-primary" aria-hidden="true" />
            Modun Electronics
          </Link>
          <p className="mt-3 max-w-xs text-sm text-subtle">
            Phones, laptops, audio and more, with clear specs and real-time stock.
          </p>
        </div>
        <FooterColumn title="Categories" links={CATEGORY_LINKS} />
        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Account" links={ACCOUNT_LINKS} />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-subtle">
          © Modun Electronics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-subtle">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
