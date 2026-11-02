import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { z } from "zod";
import { codeSchema } from "@/lib/validation";
import { getGuestView, recordAttempt, tooManyAttempts } from "@/lib/repo";
import { clientIpHash } from "@/lib/request";
import { env } from "@/lib/env";

const bodySchema = z.object({ code: codeSchema });

// POST /api/rsvp/lookup { code } → nom du foyer, places, réponse existante, table si confirmé
export const POST = withErrors(async (req: Request) => {
  if (!env.isConfigured) return NextResponse.json({ error: "Le site n'est pas encore relié à sa base de données." }, { status: 503 });
  const ip = await clientIpHash();
  if (await tooManyAttempts(ip)) {
    return NextResponse.json({ error: "Trop d'essais. Écrivez aux mariés sur WhatsApp pour recevoir votre code." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    await recordAttempt(ip, false);
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Code invalide." }, { status: 400 });
  }
  const view = await getGuestView(parsed.data.code);
  await recordAttempt(ip, Boolean(view));
  if (!view) return NextResponse.json({ error: "Ce code ne correspond à aucune invitation. Vérifiez les lettres et les chiffres." }, { status: 404 });
  return NextResponse.json(view);
});
