import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  pending: boolean;
}

export default function SubmitButton({ label, pending }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {label}
    </button>
  );
}
