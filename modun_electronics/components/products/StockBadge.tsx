import { AlertTriangle, PackageCheck, PackageX, type LucideIcon } from "lucide-react";
import type { StockStatus } from "@/types/product";

const STOCK_STYLES: Record<StockStatus, { label: string; icon: LucideIcon; className: string }> = {
  "in-stock": { label: "In stock", icon: PackageCheck, className: "bg-in-stock/10 text-in-stock" },
  "low-stock": { label: "Low stock", icon: AlertTriangle, className: "bg-low-stock/10 text-low-stock" },
  "out-of-stock": { label: "Out of stock", icon: PackageX, className: "bg-out-of-stock/10 text-out-of-stock" },
};

interface StockBadgeProps {
  status: StockStatus;
  available?: number;
}

export default function StockBadge({ status, available }: StockBadgeProps) {
  const { label, icon: Icon, className } = STOCK_STYLES[status];
  const showCount = status === "low-stock" && available !== undefined;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {showCount ? `Only ${available} left` : label}
    </span>
  );
}
