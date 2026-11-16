import { AlertCircle } from "lucide-react";

interface FormMessageProps {
  message?: string;
}

export default function FormMessage({ message }: FormMessageProps) {
  return (
    <div aria-live="polite">
      {message && (
        <p className="flex items-start gap-2 rounded-xl bg-low-stock/10 px-3 py-2.5 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
