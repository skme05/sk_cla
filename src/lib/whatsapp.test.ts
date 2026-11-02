import { describe, expect, it } from "vitest";
import { invitationMessage, phoneForWhatsApp, rsvpLink, whatsappUrl } from "./whatsapp";

describe("WhatsApp", () => {
  it("formate le numéro pour wa.me", () => {
    expect(phoneForWhatsApp("+225 07 00 00 00 01")).toBe("2250700000001");
  });
  it("met le code dans le lien de confirmation", () => {
    expect(rsvpLink("https://gael-et-clarisse.com/", "K7M4PQ")).toBe("https://gael-et-clarisse.com/?c=K7M4PQ#rsvp");
  });
  it("écrit le message d'invitation", () => {
    const m = invitationMessage({ displayName: "Famille Ilunga", code: "K7M4PQ", seats: 4 }, "https://x.com");
    expect(m).toContain("Bonjour Famille Ilunga");
    expect(m).toContain("Votre code : K7M4PQ (4 places)");
    expect(m).toContain("samedi 13 février 2027");
    expect(m).toContain("https://x.com/?c=K7M4PQ#rsvp");
    expect(m).toContain("13 janvier 2027");
  });
  it("construit le lien wa.me", () => {
    const url = whatsappUrl("+2250700000001", "Bonjour & bienvenue");
    expect(url).toBe("https://wa.me/2250700000001?text=Bonjour%20%26%20bienvenue");
    expect(whatsappUrl(null, "a")).toBe("https://wa.me/?text=a");
  });
});
