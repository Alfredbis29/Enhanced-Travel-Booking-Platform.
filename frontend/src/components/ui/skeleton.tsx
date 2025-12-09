import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted/50", className)} {...props} />
}

function TripCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-24 w-24 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => <TripCardSkeleton key={i} />)}
    </div>
  )
}

export { Skeleton, TripCardSkeleton, SearchResultsSkeleton }

