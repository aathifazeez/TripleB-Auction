"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const sizeClass = {
  sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-sm rounded-lg gap-2",
};

const variantStyle: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--color-gold)",
    color: "var(--color-bg)",
    fontWeight: 600,
  },
  secondary: {
    background: "var(--color-surface-raised)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
  },
  danger: {
    background: "var(--color-error-dim)",
    color: "var(--color-error)",
    border: "1px solid rgba(239,68,68,0.25)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-muted)",
  },
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass[size]} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
    >
      {loading && <Loader2 size={14} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}
