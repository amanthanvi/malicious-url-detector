import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "sx-input-glow flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground transition-[border-color,box-shadow] outline-none selection:bg-[color-mix(in_srgb,var(--sx-active-accent)_20%,transparent)] placeholder:text-muted-foreground/80 file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
