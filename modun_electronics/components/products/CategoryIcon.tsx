import {
  Cable,
  Camera,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { CategorySlug } from "@/types/product";

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  phones: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  audio: Headphones,
  "tvs-monitors": Monitor,
  cameras: Camera,
  gaming: Gamepad2,
  wearables: Watch,
  accessories: Cable,
};

interface CategoryIconProps {
  slug: CategorySlug;
  className?: string;
}

export default function CategoryIcon({ slug, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[slug];
  return <Icon className={className} aria-hidden="true" />;
}
