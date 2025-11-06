// components/ui/table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  withHeader?: boolean;
  withActions?: boolean;
  compact?: boolean;
  className?: string;
}

export default function TableSkeleton({
  rows = 5,
  columns = 4,
  withHeader = true,
  withActions = true,
  compact = false,
  className,
}: TableSkeletonProps) {
  const columnWidths = [
    "w-1/4", // Usually for names/titles
    "w-1/5", // Medium width
    "w-1/6", // Smaller width
    "w-1/4", // Larger width
    "w-1/5", // Medium width
  ];

  return (
    <Card className={cn("overflow-hidden shadow-none", className)}>
      {/* Table Header Skeleton */}
      {withHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Table Header Row */}
        <div className="bg-muted/30 border-b px-6 py-3">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton
                key={`header-${index}`}
                className={cn(
                  "h-4",
                  columnWidths[index] || "w-full",
                  index === 0 && "w-8", // First column often has checkboxes/avatars
                )}
              />
            ))}
            {withActions && <Skeleton className="ml-auto h-4 w-16" />}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={cn(
                "hover:bg-muted/20 px-6 transition-colors",
                compact ? "py-3" : "py-4",
              )}
            >
              <div className="flex items-center gap-4">
                {/* First column - usually avatar/checkbox */}
                <Skeleton className="h-8 w-8 rounded-full" />

                {/* Dynamic columns */}
                {Array.from({ length: columns - 1 }).map((_, colIndex) => (
                  <Skeleton
                    key={`row-${rowIndex}-col-${colIndex}`}
                    className={cn(
                      "h-4",
                      columnWidths[colIndex + 1] || "w-full",
                      colIndex === 0 && "h-5", // First data column often slightly larger
                    )}
                  />
                ))}

                {/* Action buttons */}
                {withActions && (
                  <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                )}
              </div>

              {/* Optional: Progressively longer delay for rows */}
              <style jsx>{`
                div:nth-child(${rowIndex + 1}) {
                  animation-delay: ${rowIndex * 0.1}s;
                }
              `}</style>
            </div>
          ))}
        </div>

        {/* Table Footer Skeleton */}
        <div className="bg-muted/30 border-t px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
