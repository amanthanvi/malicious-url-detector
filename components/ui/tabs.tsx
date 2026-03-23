"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-auto items-center gap-1 rounded-full border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_84%,transparent)] p-1 text-[var(--sx-text-muted)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "sx-btn-press sx-font-sans focus-visible:ring-offset-background inline-flex min-h-10 items-center justify-center rounded-full border border-transparent px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--sx-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-[var(--sx-active-accent)] data-[state=active]:bg-[var(--sx-active-accent)] data-[state=active]:text-[var(--sx-accent-fg)]",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
