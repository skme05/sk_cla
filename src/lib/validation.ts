import { z } from "zod";
import { isValidCode, normalizeCode } from "./codes";

export const codeSchema = z
  .string()
  .max(20)
  .transform(normalizeCode)
  .refine(isValidCode, { message: "Le code contient 6 caractères. Recopiez-le depuis le message WhatsApp." });

export const diets = ["none", "vegetarian", "no_pork", "no_seafood", "allergy"] as const;

export const rsvpSchema = z
  .object({
    code: codeSchema,
    attending: z.boolean(),
    guestCount: z.number().int().min(0).max(20),
    diet: z.enum(diets).default("none"),
    message: z.string().trim().max(1000).optional().transform((m) => (m ? m : null)),
  })
  .refine((v) => (v.attending ? v.guestCount >= 1 : v.guestCount === 0), {
    message: "Indiquez au moins une personne, ou répondez que vous ne venez pas.",
    path: ["guestCount"],
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;

/** Numéros saisis par les mariés : « 07 00 00 00 00 » devient « +2250700000000 » (Côte d'Ivoire par défaut). */
export function normalizePhone(raw: string, defaultCountry = "225"): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.length === 10 && !digits.startsWith(defaultCountry)) digits = defaultCountry + digits;
  return `+${digits}`;
}

export const householdSchema = z.object({
  displayName: z.string().trim().min(1, "Le nom est obligatoire.").max(120),
  phone: z
    .string()
    .optional()
    .transform((p) => (p ? normalizePhone(p) : null))
    .refine((p) => p === null || /^\+[1-9][0-9]{7,14}$/.test(p), { message: "Numéro invalide." }),
  seats: z.coerce.number().int().min(1).max(20),
  tableId: z
    .string()
    .optional()
    .transform((t) => (t ? t : null)),
});
