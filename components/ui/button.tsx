"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "sx-btn-press sx-font-sans inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--sx-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        terminal:
          "border border-[var(--sx-active-accent)] bg-[var(--sx-active-accent)] text-[var(--sx-accent-fg)] shadow-[0_20px_46px_-28px_color-mix(in_srgb,var(--sx-active-accent)_60%,transparent)] hover:-translate-y-0.5 hover:brightness-105",
        ghost:
          "border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_72%,transparent)] text-[var(--sx-text-muted)] hover:border-[var(--sx-active-accent)] hover:bg-[color-mix(in_srgb,var(--sx-surface-strong)_90%,transparent)] hover:text-[var(--sx-text)]",
        subtle:
          "border border-transparent bg-[color-mix(in_srgb,var(--sx-surface-elevated)_76%,transparent)] text-[var(--sx-text-muted)] hover:bg-[color-mix(in_srgb,var(--sx-surface-strong)_82%,transparent)] hover:text-[var(--sx-text)]",
        danger:
          "border border-[color-mix(in_srgb,var(--sx-malicious)_36%,transparent)] text-[var(--sx-malicious)] hover:bg-[color-mix(in_srgb,var(--sx-malicious)_10%,transparent)]",
        dangerSolid:
          "border border-[var(--sx-malicious)] bg-[var(--sx-malicious)] text-white hover:-translate-y-0.5 hover:brightness-105",
        tab: "border border-[var(--sx-border)] bg-transparent text-[var(--sx-text-muted)] data-[state=active]:border-[var(--sx-active-accent)] data-[state=active]:bg-[var(--sx-active-accent)] data-[state=active]:text-[var(--sx-accent-fg)] hover:border-[var(--sx-active-accent)] hover:text-[var(--sx-text)]",
        view: "border border-transparent bg-transparent text-[var(--sx-text-muted)] data-[state=active]:bg-[color-mix(in_srgb,var(--sx-surface-strong)_90%,transparent)] data-[state=active]:text-[var(--sx-text)] hover:text-[var(--sx-text)]",
      },
      size: {
        default: "min-h-11 px-4 py-2.5",
        sm: "min-h-10 px-3.5 py-2 text-[10px]",
        icon: "h-11 w-11 px-0 py-0",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
