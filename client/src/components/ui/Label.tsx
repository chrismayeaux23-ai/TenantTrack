import React from "react";
import { cn } from "./Button";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";
