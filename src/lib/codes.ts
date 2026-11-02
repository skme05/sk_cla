import { randomInt } from "node:crypto";

/** Alphabet sans caractères ambigus : ni 0/O ni 1/I. Doit rester aligné avec la contrainte SQL. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;
const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

/** Met en majuscules et retire espaces, tirets et ponctuation copiés depuis WhatsApp. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidCode(code: string): boolean {
  return CODE_RE.test(code);
}

export function generateCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}
