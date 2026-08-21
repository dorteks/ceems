export const DEFAULT_PASSWORD = "Ceems@2026";

export function generateTemporaryPassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint32Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => chars[value % chars.length]).join("");
  }

  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * chars.length);
    return chars[index] ?? chars[0]!;
  }).join("");
}
