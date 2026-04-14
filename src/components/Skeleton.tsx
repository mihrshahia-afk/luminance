export function SkeletonLine({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="card-elevated p-5">
      <SkeletonLine width="40%" height="0.6rem" />
      <div className="mt-3"><SkeletonLine width="75%" height="1.1rem" /></div>
      <div className="mt-3"><SkeletonLine width="100%" height="0.85rem" /></div>
      <div className="mt-1.5"><SkeletonLine width="60%" height="0.85rem" /></div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="flex-1 flex items-center justify-center w-full min-h-[60vh]">
      <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );
}

export function SkeletonReader() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 md:py-10 space-y-4">
      <SkeletonLine width="50%" height="1.5rem" />
      <div className="space-y-3 mt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonLine key={i} width={`${85 + Math.random() * 15}%`} height="1rem" />
        ))}
      </div>
      <div className="space-y-3 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLine key={i} width={`${80 + Math.random() * 20}%`} height="1rem" />
        ))}
      </div>
    </div>
  );
}
