import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "sx-input-glow flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
