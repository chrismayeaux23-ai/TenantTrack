import React from "react";
import { cn } from "./Button";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 border-input bg-transparent px-4 py-3 text-base transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
