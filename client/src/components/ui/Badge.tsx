import React from "react";
import { cn } from "./Button";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    outline: "border-border text-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
