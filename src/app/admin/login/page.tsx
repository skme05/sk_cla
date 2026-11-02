import { login } from "../actions";
import { adminConfigured } from "@/lib/auth";

export const metadata = { title: "Espace mariés" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erreur?: string; config?: string }> }) {
  const { erreur } = await searchParams;
  if (!adminConfigured()) {
    return (
      <main className="admin"><div className="wrap" style={{ maxWidth: 520 }}>
        <h1>Espace mariés</h1>
        <p className="error">Le site n&apos;est pas encore configuré : renseignez SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_PASSWORD et SESSION_SECRET (32 caractères minimum). Voir le README.</p>
      </div></main>
    );
  }
  return (
    <main className="admin"><div className="wrap" style={{ maxWidth: 420 }}>
      <h1>Espace mariés</h1>
      <p>Entrez le mot de passe pour gérer les invités.</p>
      <form action={login} className="row" style={{ display: "grid" }}>
        <label htmlFor="password">Mot de passe<input id="password" name="password" type="password" required autoFocus /></label>
        {erreur && <p className="error">Mot de passe incorrect.</p>}
        <button className="abtn" type="submit">Se connecter</button>
      </form>
    </div></main>
  );
}
