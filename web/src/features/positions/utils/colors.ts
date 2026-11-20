/** `#RRGGBB` → `rgba(r, g, b, alpha)`, for tinted backgrounds. Colours come from the API. */
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
