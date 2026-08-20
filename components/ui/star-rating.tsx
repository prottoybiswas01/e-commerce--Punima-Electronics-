import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating = 5,
  count,
  size = "sm",
}: {
  rating?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSizes[size],
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 fill-slate-100"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 font-medium ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
