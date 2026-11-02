import { wedding } from "@/content/wedding";

/** Garde uniquement les chiffres, au format international attendu par wa.me (sans « + »). */
export function phoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function rsvpLink(siteUrl: string, code: string): string {
  return `${siteUrl.replace(/\/$/, "")}/?c=${encodeURIComponent(code)}#rsvp`;
}

export function invitationMessage(h: { displayName: string; code: string; seats: number }, siteUrl: string): string {
  const places = h.seats > 1 ? `${h.seats} places` : "1 place";
  return [
    `Bonjour ${h.displayName} 🌺`,
    `${wedding.couple.first} et ${wedding.couple.second} ont la joie de vous inviter à leur mariage sous les tropiques, le ${wedding.dateLabel.toLowerCase()} à Grand-Bassam, au bord de la mer.`,
    "",
    `Votre code : ${h.code} (${places})`,
    "Confirmez et découvrez votre table :",
    rsvpLink(siteUrl, h.code),
    "",
    `Merci de répondre avant le ${wedding.rsvpDeadlineLabel}.`,
  ].join("\n");
}

export function reminderMessage(h: { displayName: string; code: string }, siteUrl: string): string {
  return [
    `Bonjour ${h.displayName},`,
    `Petit rappel : nous n'avons pas encore votre réponse pour le mariage de ${wedding.couple.first} et ${wedding.couple.second}.`,
    `Votre code : ${h.code}`,
    rsvpLink(siteUrl, h.code),
  ].join("\n");
}

/** Lien qui ouvre WhatsApp avec le message prêt ; l'envoi reste manuel, depuis le numéro des mariés. */
export function whatsappUrl(phone: string | null, message: string): string {
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phoneForWhatsApp(phone)}?text=${text}` : `https://wa.me/?text=${text}`;
}
