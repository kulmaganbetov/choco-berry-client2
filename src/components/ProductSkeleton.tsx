export function ProductSkeleton() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="aspect-square skeleton-shimmer bg-rose/20" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-full skeleton-shimmer bg-rose/20" />
        <div className="h-3 w-full rounded-full skeleton-shimmer bg-rose/15" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-7 w-24 rounded-full skeleton-shimmer bg-rose/20" />
          <div className="h-9 w-24 rounded-full skeleton-shimmer bg-rose/25" />
        </div>
      </div>
    </div>
  );
}
