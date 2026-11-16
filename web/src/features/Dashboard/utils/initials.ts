/** Up to two initials from a name, e.g. "Red Chilli Entertainment" → "RC". */
export function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
