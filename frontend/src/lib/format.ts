// Default display currency. The backend mirrors this via STRIPE_CURRENCY and
// returns amounts in the same currency, so they stay in sync.
export const DEFAULT_CURRENCY = "USD";

/**
 * Formats a monetary amount for display. Accepts numbers or numeric strings
 * (Postgres `numeric` columns arrive as strings over JSON), guarding against
 * NaN and floating-point noise like `$23.969999`.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(safe);
}
