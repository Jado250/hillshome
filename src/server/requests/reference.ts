/** Formats the Nth request as HS-REQ-000001. */
export function formatReference(n: number): string {
  return `HS-REQ-${String(n).padStart(6, "0")}`;
}
