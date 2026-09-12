import * as React from "react";
import { cn } from "../../lib/utils";

const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative" {...props}>{children}</div>
    </SelectContext.Provider>
  );
};

const SelectContext = React.createContext({});

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(SelectContext);
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>;
};

const SelectContent = ({ className, children }) => (
  <div
    className={cn(
      "absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg animate-fade-in",
      className
    )}
  >
    {children}
  </div>
);

const SelectItem = ({ value: itemValue, children, className }) => {
  const { value, onValueChange } = React.useContext(SelectContext);
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm text-foreground",
        "hover:bg-secondary transition-colors",
        value === itemValue && "bg-primary/10 text-primary",
        className
      )}
      onClick={() => onValueChange && onValueChange(itemValue)}
    >
      {children}
    </div>
  );
};

// Simpler native select wrapper for forms
const NativeSelect = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground",
      "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
NativeSelect.displayName = "NativeSelect";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, NativeSelect };
