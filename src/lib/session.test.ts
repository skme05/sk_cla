import { describe, expect, it } from "vitest";
import { createSessionToken, safeEqual, verifySessionToken } from "./session";

const SECRET = "x".repeat(40);

describe("session admin", () => {
  it("valide un jeton signé", () => {
    expect(verifySessionToken(createSessionToken(SECRET), SECRET)).toBe(true);
  });
  it("refuse un jeton expiré, falsifié ou signé avec un autre secret", () => {
    const old = createSessionToken(SECRET, 60, Date.now() - 120_000);
    expect(verifySessionToken(old, SECRET)).toBe(false);
    const t = createSessionToken(SECRET);
    expect(verifySessionToken(t.replace(/\.\d+\./, ".9999999999."), SECRET)).toBe(false);
    expect(verifySessionToken(t, "y".repeat(40))).toBe(false);
    expect(verifySessionToken(undefined, SECRET)).toBe(false);
  });
  it("compare les mots de passe", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
  });
});
