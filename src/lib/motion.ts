/** Les animations sont-elles permises ? (préférence système + bouton « Réduire les animations »). Côté navigateur uniquement. */
export function motionOn(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return !document.getElementById("site")?.classList.contains("still");
}

/** Téléphone modeste ou économie de données : moins de particules, pas d'effets coûteux. */
export function liteDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 2 || Boolean(n.connection?.saveData);
}
