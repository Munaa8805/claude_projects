import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-subtle">{subtitle}</p>
      <div className="mt-6">{children}</div>
      <p className="mt-6 text-center text-sm text-subtle">
        {footerText}{" "}
        <Link href={footerHref} className="font-medium text-primary hover:underline">
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
