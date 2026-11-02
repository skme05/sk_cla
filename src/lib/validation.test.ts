import { describe, expect, it } from "vitest";
import { householdSchema, normalizePhone, rsvpSchema } from "./validation";

describe("validation des réponses", () => {
  it("accepte une présence valide et normalise le code", () => {
    const r = rsvpSchema.parse({ code: "k7m4pq", attending: true, guestCount: 3, diet: "vegetarian", message: " Bravo " });
    expect(r).toMatchObject({ code: "K7M4PQ", guestCount: 3, message: "Bravo" });
  });
  it("refuse une présence sans personne", () => {
    expect(rsvpSchema.safeParse({ code: "K7M4PQ", attending: true, guestCount: 0 }).success).toBe(false);
  });
  it("refuse une absence avec des personnes", () => {
    expect(rsvpSchema.safeParse({ code: "K7M4PQ", attending: false, guestCount: 2 }).success).toBe(false);
  });
  it("refuse un code mal formé", () => {
    expect(rsvpSchema.safeParse({ code: "ABC", attending: false, guestCount: 0 }).success).toBe(false);
  });
});

describe("numéros de téléphone", () => {
  it("ajoute l'indicatif ivoirien par défaut", () => {
    expect(normalizePhone("07 00 00 00 01")).toBe("+2250700000001");
  });
  it("garde un numéro international", () => {
    expect(normalizePhone("+243 81 000 0000")).toBe("+243810000000");
    expect(normalizePhone("0033 6 12 34 56 78")).toBe("+33612345678");
  });
  it("valide un foyer", () => {
    expect(householdSchema.parse({ displayName: "Famille Ilunga", phone: "07 00 00 00 01", seats: "4" })).toEqual({
      displayName: "Famille Ilunga", phone: "+2250700000001", seats: 4, tableId: null,
    });
  });
});
