import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "sx-input-glow flex min-h-28 w-full rounded-md border border-[var(--sx-border)] bg-[var(--sx-surface)] px-3 py-2 text-sm text-[var(--sx-text)] shadow-xs transition-[border-color,box-shadow,color] outline-none placeholder:text-[var(--sx-text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
