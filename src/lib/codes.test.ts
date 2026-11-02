import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, generateCode, isValidCode, normalizeCode } from "./codes";

describe("codes d'invitation", () => {
  it("n'utilise aucun caractère ambigu", () => {
    for (const c of "01IO") expect(CODE_ALPHABET).not.toContain(c);
    expect(new Set(CODE_ALPHABET).size).toBe(32);
  });
  it("génère des codes valides", () => {
    for (let i = 0; i < 500; i++) expect(isValidCode(generateCode())).toBe(true);
  });
  it("nettoie un code copié depuis WhatsApp", () => {
    expect(normalizeCode(" k7m-4pq ")).toBe("K7M4PQ");
    expect(isValidCode(normalizeCode("k7m 4pq"))).toBe(true);
  });
  it("refuse les codes avec O, 0, I ou 1, ou de mauvaise longueur", () => {
    for (const c of ["K7M4P0", "K7M4PO", "K7M4PI", "K7M4P1", "K7M4P", "K7M4PQR"]) expect(isValidCode(c)).toBe(false);
  });
});
