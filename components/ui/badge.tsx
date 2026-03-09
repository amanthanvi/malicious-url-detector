import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "sx-font-sans inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors",
  {
    variants: {
      variant: {
        safe: "border-[color-mix(in_srgb,var(--sx-safe)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-safe)_12%,transparent)] text-[var(--sx-safe)]",
        suspicious:
          "border-[color-mix(in_srgb,var(--sx-suspicious)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-suspicious)_12%,transparent)] text-[var(--sx-suspicious)]",
        malicious:
          "border-[color-mix(in_srgb,var(--sx-malicious)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-malicious)_12%,transparent)] text-[var(--sx-malicious)]",
        critical:
          "border-[color-mix(in_srgb,var(--sx-critical)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-critical)_12%,transparent)] text-[var(--sx-critical)]",
        active:
          "border-[color-mix(in_srgb,var(--sx-info)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-info)_12%,transparent)] text-[var(--sx-info)]",
        error:
          "border-[color-mix(in_srgb,var(--sx-error)_45%,transparent)] bg-[color-mix(in_srgb,var(--sx-error)_10%,transparent)] text-[var(--sx-error)]",
        skipped:
          "border-[var(--sx-border-muted)] bg-transparent text-[var(--sx-text-muted)] opacity-80",
        neutral:
          "border-[var(--sx-border)] bg-[var(--sx-surface-elevated)] text-[var(--sx-text-muted)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
