import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, disabled, ...props }, ref) => {
    const variants = {
      default: "gradient-primary text-white shadow-lg hover:opacity-90 active:scale-95",
      outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
      ghost: "bg-transparent text-foreground hover:bg-secondary",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      link: "text-primary underline-offset-4 hover:underline bg-transparent",
    };

    const sizes = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-8 px-4 py-1.5 text-xs",
      lg: "h-12 px-8 py-3 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
