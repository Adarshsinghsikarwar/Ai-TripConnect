/**
 * components/shared/ErrorMessage.jsx
 * Generic error display component.
 */
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ErrorMessage({ message, onRetry, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-12 px-6 text-center",
        className
      )}
    >
      <div className="p-3 rounded-full bg-red-50">
        <AlertCircle className="text-red-500" size={28} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">Something went wrong</p>
        <p className="text-sm text-light-muted mt-1">
          {message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-500 font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Small inline error for form fields.
 */
export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}
