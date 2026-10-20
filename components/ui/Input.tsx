import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, id, className = "", style, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${className}`}
        style={{
          background: "var(--color-surface-raised)",
          border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          color: "var(--color-text)",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? "var(--color-error)" : "var(--color-gold)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "var(--color-error)" : "var(--color-border)";
          props.onBlur?.(e);
        }}
      />
      {error && <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>{hint}</p>}
    </div>
  );
}
