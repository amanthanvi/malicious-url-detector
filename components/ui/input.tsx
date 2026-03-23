import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "sx-input-glow flex h-11 w-full rounded-[1rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] px-3.5 py-2 text-sm text-[var(--sx-text)] shadow-none transition-[border-color,box-shadow,color,background-color] outline-none selection:bg-[color-mix(in_srgb,var(--sx-active-accent)_20%,transparent)] file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--sx-text-soft)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
