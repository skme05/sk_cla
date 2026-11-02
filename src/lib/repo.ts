import "server-only";
import { db } from "./supabase";
import { wedding } from "@/content/wedding";
import type { GuestOverview, GuestView, MenuItem, SeatingTable } from "./types";
import type { RsvpInput } from "./validation";

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MIN = 15;

export function deadlinePassed(now = new Date()): boolean {
  return now > new Date(wedding.rsvpDeadline);
}

// ----- Anti-devinette des codes -----
export async function tooManyAttempts(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MIN * 60_000).toISOString();
  const { count, error } = await db()
    .from("code_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("success", false)
    .gte("attempted_at", since);
  if (error) throw error;
  return (count ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export async function recordAttempt(ipHash: string, success: boolean): Promise<void> {
  const { error } = await db().from("code_attempts").insert({ ip_hash: ipHash, success });
  if (error) throw error;
}

// ----- Côté invité -----
async function findHousehold(code: string) {
  const { data, error } = await db()
    .from("households")
    .select("id, display_name, seats, table_id, rsvps(attending, guest_count, diet, message)")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function tableLayout(): Promise<SeatingTable[]> {
  const { data, error } = await db()
    .from("seating_tables")
    .select("id, name, capacity, pos_x, pos_y")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getGuestView(code: string): Promise<GuestView | null> {
  const h = await findHousehold(code);
  if (!h) return null;
  const r = Array.isArray(h.rsvps) ? h.rsvps[0] : h.rsvps;
  const rsvp = r ? { attending: r.attending, guestCount: r.guest_count, diet: r.diet, message: r.message } : null;
  let table: GuestView["table"] = null;
  if (rsvp?.attending && h.table_id) {
    const layout = await tableLayout();
    const mine = layout.find((t) => t.id === h.table_id);
    if (mine) table = { name: mine.name, layout };
  }
  return { displayName: h.display_name, seats: h.seats, rsvp, table, deadlinePassed: deadlinePassed() };
}

export type SaveResult = { ok: true; view: GuestView } | { ok: false; reason: "not_found" | "deadline" | "too_many" };

export async function saveRsvp(input: RsvpInput): Promise<SaveResult> {
  if (deadlinePassed()) return { ok: false, reason: "deadline" };
  const h = await findHousehold(input.code);
  if (!h) return { ok: false, reason: "not_found" };
  if (input.guestCount > h.seats) return { ok: false, reason: "too_many" };
  const { error } = await db().from("rsvps").upsert({
    household_id: h.id,
    attending: input.attending,
    guest_count: input.attending ? input.guestCount : 0,
    diet: input.attending ? input.diet : "none",
    message: input.message,
  });
  if (error) throw error;
  const view = await getGuestView(input.code);
  return { ok: true, view: view! };
}

// ----- Menu -----
export async function getMenu(): Promise<MenuItem[]> {
  const { data, error } = await db()
    .from("menu_items")
    .select("id, course, name, description, tags, image_url")
    .eq("published", true)
    .order("course")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

// ----- Espace mariés -----
export async function getGuestOverview(): Promise<GuestOverview[]> {
  const { data, error } = await db().from("guest_overview").select("*").order("display_name");
  if (error) throw error;
  return (data ?? []) as GuestOverview[];
}

export async function getTables(): Promise<(SeatingTable & { seats_assigned: number; guests_confirmed: number })[]> {
  const { data, error } = await db().from("table_occupancy").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function createHousehold(h: { displayName: string; phone: string | null; seats: number; tableId: string | null }) {
  const { error } = await db()
    .from("households")
    .insert({ display_name: h.displayName, phone: h.phone, seats: h.seats, table_id: h.tableId });
  if (error) throw error;
}

export async function markInvitationSent(id: string) {
  const { error } = await db().from("households").update({ invitation_sent_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
