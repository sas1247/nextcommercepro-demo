export const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
export const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Accepts amount in cents (integer).
 */
export function formatMoney(cents: number) {
  return nfMoney.format((Number(cents) || 0) / 100);
}