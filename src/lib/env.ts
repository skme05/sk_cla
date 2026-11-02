import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name} (voir .env.example)`);
  return v;
}

export const env = {
  get supabaseUrl() { return required("SUPABASE_URL"); },
  /** Clé secrète Supabase (sb_secret_…). L'ancienne clé service_role est encore acceptée. */
  get supabaseServiceKey() {
    const k = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!k) throw new Error("Variable d'environnement manquante : SUPABASE_SECRET_KEY (voir .env.example)");
    return k;
  },
  get adminPassword() { return required("ADMIN_PASSWORD"); },
  get sessionSecret() {
    const s = required("SESSION_SECRET");
    if (s.length < 32) throw new Error("SESSION_SECRET doit faire au moins 32 caractères");
    return s;
  },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; },
  get isConfigured() { return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)); },
};
