"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminConfigured, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { safeEqual } from "@/lib/session";
import { env } from "@/lib/env";
import { householdSchema } from "@/lib/validation";
import { createHousehold, markInvitationSent } from "@/lib/repo";

export async function login(formData: FormData) {
  if (!adminConfigured()) redirect("/admin/login?config=1");
  const password = String(formData.get("password") ?? "");
  if (!safeEqual(password, env.adminPassword)) redirect("/admin/login?erreur=1");
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

export async function addHousehold(formData: FormData) {
  await requireAdmin();
  const parsed = householdSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone") || undefined,
    seats: formData.get("seats"),
    tableId: formData.get("tableId") || undefined,
  });
  if (!parsed.success) redirect(`/admin?erreur=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Saisie invalide")}`);
  await createHousehold(parsed.data);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function markSent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await markInvitationSent(id);
  revalidatePath("/admin");
}
