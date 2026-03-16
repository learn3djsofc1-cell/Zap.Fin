export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="w-32 h-4 mb-2" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-3 mb-2" />
      <Skeleton className="w-3/4 h-3" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-t border-white/[0.03]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="w-20 h-3" />
        </td>
      ))}
    </tr>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-[#0D0E12] rounded-2xl p-5 border border-white/[0.04]">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-24 h-7 mb-2" />
      <Skeleton className="w-20 h-3" />
    </div>
  );
}
