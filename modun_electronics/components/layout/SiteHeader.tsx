import Link from "next/link";
import { User, Zap } from "lucide-react";


export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Zap className="size-5 text-primary" aria-hidden="true" />
          Modun Electronics
        </Link>
    
        <nav className="ml-auto flex items-center gap-5 text-sm font-medium text-subtle">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <User className="size-4" aria-hidden="true" />
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
