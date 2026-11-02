import { createHmac, timingSafeEqual } from "node:crypto";

// Session admin minimale : jeton « expiration.signature » signé HMAC-SHA256, stocké en cookie httpOnly.
const SEP = ".";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string, ttlSeconds = 60 * 60 * 24 * 14, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + ttlSeconds;
  const payload = `admin${SEP}${exp}`;
  return `${payload}${SEP}${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split(SEP);
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const payload = `${parts[0]}${SEP}${parts[1]}`;
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(parts[1]) * 1000 > now;
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
}
