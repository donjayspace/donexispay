export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}
