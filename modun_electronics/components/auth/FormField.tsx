interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  defaultValue?: string;
  errors?: string[];
}

export default function FormField({
  id,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  errors,
}: FormFieldProps) {
  const hasError = Boolean(errors?.length);
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`h-11 rounded-xl border bg-surface px-3 text-sm outline-none transition focus:ring-2 ${
          hasError
            ? "border-out-of-stock focus:ring-out-of-stock/20"
            : "border-border focus:border-primary focus:ring-primary/20"
        }`}
      />
      {hasError && (
        <p id={errorId} className="text-xs text-out-of-stock">
          {errors?.[0]}
        </p>
      )}
    </div>
  );
}
