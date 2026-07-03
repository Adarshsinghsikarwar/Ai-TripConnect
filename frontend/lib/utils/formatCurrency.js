/**
 * lib/utils/formatCurrency.js
 * Format numbers as INR currency strings.
 * Usage: formatCurrency(1500) → "₹1,500"
 */
export function formatCurrency(amount, currency = "INR") {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with Indian thousands separator.
 * Usage: formatNumber(150000) → "1,50,000"
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
}
