/**
 * components/shared/StarRating.jsx
 * A simple star rating display (read-only or interactive).
 */
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function StarRating({
  rating = 0,
  max = 5,
  interactive = false,
  onRate,
  size = "sm",
  className,
}) {
  const starSize = size === "sm" ? 14 : size === "md" ? 18 : 22;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          size={starSize}
          className={cn(
            "transition-colors",
            star <= rating
              ? "fill-accent-500 text-accent-500"
              : "fill-slate-200 text-slate-200",
            interactive && "cursor-pointer hover:fill-accent-400 hover:text-accent-400"
          )}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

/**
 * Rating with count label — e.g. "★ 4.8 (32 reviews)"
 */
export function RatingBadge({ rating, count, className }) {
  if (!rating) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-slate-700",
        className
      )}
    >
      <Star size={14} className="fill-accent-500 text-accent-500" />
      <span>{Number(rating).toFixed(1)}</span>
      {count > 0 && (
        <span className="text-light-muted font-normal">({count})</span>
      )}
    </span>
  );
}
