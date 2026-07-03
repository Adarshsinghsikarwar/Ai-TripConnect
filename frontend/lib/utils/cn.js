/**
 * lib/utils/cn.js
 * Merges Tailwind classes safely — combines clsx + tailwind-merge.
 * Usage: cn("px-4 py-2", isActive && "bg-brand-500")
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
