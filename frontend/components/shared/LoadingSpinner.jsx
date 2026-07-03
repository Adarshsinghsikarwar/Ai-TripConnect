/**
 * components/shared/LoadingSpinner.jsx
 * A simple animated spinner — used on loading states throughout the app.
 */
import { cn } from "@/lib/utils/cn";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
  xl: "h-16 w-16 border-4",
};

export default function LoadingSpinner({ size = "md", className }) {
  return (
    <div
      className={cn(
        "inline-block rounded-full border-brand-500 border-t-transparent animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-page loading overlay.
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-light">
      <LoadingSpinner size="xl" />
      <p className="text-light-muted text-sm animate-pulse">Loading...</p>
    </div>
  );
}

/**
 * Skeleton block for card loading states.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 rounded-lg",
        className
      )}
    />
  );
}
