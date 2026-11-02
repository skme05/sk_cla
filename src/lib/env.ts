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
  /**
   * URL publique utilisée dans les liens WhatsApp. Ordre : NEXT_PUBLIC_SITE_URL, puis le domaine
   * de production Vercel, puis l'adresse de la requête en cours (jamais localhost chez un invité).
   */
  siteUrlFrom(requestOrigin?: string | null): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit;
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercel) return `https://${vercel}`;
    return requestOrigin ?? "http://localhost:3000";
  },
  get isConfigured() { return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)); },
};
