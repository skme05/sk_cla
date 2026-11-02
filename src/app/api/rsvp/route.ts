import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { rsvpSchema } from "@/lib/validation";
import { recordAttempt, saveRsvp, tooManyAttempts } from "@/lib/repo";
import { clientIpHash } from "@/lib/request";
import { env } from "@/lib/env";
import { wedding } from "@/content/wedding";

const reasons = {
  not_found: { status: 404, error: "Ce code ne correspond à aucune invitation." },
  deadline: { status: 403, error: `Les réponses sont closes depuis le ${wedding.rsvpDeadlineLabel}. Écrivez aux mariés sur WhatsApp.` },
  too_many: { status: 400, error: "Le nombre de personnes dépasse les places réservées pour vous." },
} as const;

// POST /api/rsvp { code, attending, guestCount, diet, message } → enregistre ou modifie la réponse
export const POST = withErrors(async (req: Request) => {
  if (!env.isConfigured) return NextResponse.json({ error: "Le site n'est pas encore relié à sa base de données." }, { status: 503 });
  const ip = await clientIpHash();
  if (await tooManyAttempts(ip)) return NextResponse.json({ error: "Trop d'essais. Réessayez plus tard." }, { status: 429 });
  const parsed = rsvpSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Réponse invalide." }, { status: 400 });
  const result = await saveRsvp(parsed.data);
  if (!result.ok) {
    if (result.reason === "not_found") await recordAttempt(ip, false);
    const r = reasons[result.reason];
    return NextResponse.json({ error: r.error }, { status: r.status });
  }
  return NextResponse.json(result.view);
});
