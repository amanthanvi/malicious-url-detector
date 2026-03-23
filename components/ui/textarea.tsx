import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "sx-input-glow flex min-h-28 w-full rounded-[1rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] px-3.5 py-3 text-sm text-[var(--sx-text)] shadow-none transition-[border-color,box-shadow,color,background-color] outline-none placeholder:text-[var(--sx-text-soft)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
