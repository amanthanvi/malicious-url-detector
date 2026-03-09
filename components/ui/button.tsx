"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "sx-btn-press sx-font-sans inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold tracking-[0.14em] uppercase transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--sx-active-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        terminal:
          "border border-[var(--sx-active-accent)] bg-[var(--sx-active-accent)] text-[var(--sx-accent-fg)] shadow-[0_0_12px_color-mix(in_srgb,var(--sx-active-accent)_20%,transparent)] hover:brightness-110",
        ghost:
          "border border-[var(--sx-border)] bg-transparent text-[var(--sx-text-muted)] hover:border-[var(--sx-active-accent)] hover:text-[var(--sx-active-accent)]",
        subtle:
          "border border-transparent bg-[var(--sx-surface-elevated)] text-[var(--sx-text-muted)] hover:bg-[var(--sx-surface)] hover:text-[var(--sx-text)]",
        danger:
          "border border-[var(--sx-malicious)] text-[var(--sx-malicious)] hover:bg-[color-mix(in_srgb,var(--sx-malicious)_12%,transparent)]",
        dangerSolid:
          "border border-[var(--sx-malicious)] bg-[var(--sx-malicious)] text-white hover:brightness-110",
        tab: "border border-[var(--sx-border)] bg-transparent text-[var(--sx-text-muted)] data-[state=active]:border-[var(--sx-active-accent)] data-[state=active]:bg-[var(--sx-active-accent)] data-[state=active]:text-[var(--sx-accent-fg)] hover:border-[var(--sx-active-accent)] hover:text-[var(--sx-active-accent)]",
        view: "border border-transparent bg-transparent text-[var(--sx-text-muted)] data-[state=active]:bg-[var(--sx-active-accent)] data-[state=active]:text-[var(--sx-accent-fg)] hover:text-[var(--sx-text)]",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-2.5 py-1.5 text-[11px]",
        icon: "h-9 w-9 px-0 py-0",
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
