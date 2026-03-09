function Block({ className }: { className?: string }) {
  return <div className={`sx-shimmer rounded ${className ?? ""}`} />;
}

export function LoadingSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-5 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[1fr_minmax(0,2fr)_300px]">
      {/* Signal grid skeleton */}
      <div className="order-3 space-y-3 xl:order-1">
        <Block className="h-4 w-24" />
        <Block className="h-24" />
        <Block className="h-24" />
        <Block className="h-24" />
      </div>

      {/* Center column skeleton */}
      <div className="order-1 space-y-5 xl:order-2">
        <div className="flex gap-2">
          <Block className="h-8 w-28" />
          <Block className="h-8 w-28" />
        </div>
        <Block className="h-32" />
        <Block className="h-64" />
      </div>

      {/* History panel skeleton */}
      <div className="order-2 xl:order-3">
        <Block className="h-80" />
      </div>
    </div>
  );
}
