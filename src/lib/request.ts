import "server-only";
import { headers } from "next/headers";
import { hashIp } from "./session";
import { env } from "./env";

export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return hashIp(ip, env.sessionSecret);
}
