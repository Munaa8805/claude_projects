import type { SVGProps } from "react";

/** Minimal stroke icons, 16px by default, inheriting currentColor. */
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M8 3v10M3 8h10" />
  </Icon>
);

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon strokeWidth={2.5} {...p}>
    <path d="M3.5 8.5l3 3 6-7" />
  </Icon>
);

export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon strokeWidth={1.75} {...p}>
    <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" />
  </Icon>
);

export const PencilIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon strokeWidth={1.75} {...p}>
    <path d="M10.5 2.5l3 3-8 8H2.5v-3z" />
  </Icon>
);

export const GripIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon stroke="none" fill="currentColor" {...p}>
    {[3, 8, 13].flatMap((y) => [5.5, 10.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.25} />))}
  </Icon>
);
