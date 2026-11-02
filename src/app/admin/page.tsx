import { requireAdmin } from "@/lib/auth";
import { getGuestOverview, getTables } from "@/lib/repo";
import { invitationMessage, reminderMessage, whatsappUrl } from "@/lib/whatsapp";
import { env } from "@/lib/env";
import { dietLabels } from "@/content/wedding";
import { addHousehold, logout, markSent } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espace mariés" };

const statusLabel = { attending: "Présent", declined: "Absent", pending: "Sans réponse" } as const;

export default async function Admin({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  await requireAdmin();
  const { erreur } = await searchParams;
  const [guests, tables] = await Promise.all([getGuestOverview(), getTables()]);
  const site = env.siteUrl;

  const invited = guests.reduce((n, g) => n + g.seats, 0);
  const coming = guests.filter((g) => g.status === "attending").reduce((n, g) => n + g.guest_count, 0);
  const declined = guests.filter((g) => g.status === "declined").length;
  const pending = guests.filter((g) => g.status === "pending").length;

  return (
    <main className="admin"><div className="wrap">
      <div className="top">
        <div><h1>Espace mariés</h1><p style={{ margin: 0, color: "#5b6172" }}>{guests.length} foyers invités</p></div>
        <form action={logout}><button className="abtn light" type="submit">Se déconnecter</button></form>
      </div>

      <div className="stats">
        <div className="stat"><b>{invited}</b><span>places invitées</span></div>
        <div className="stat"><b>{coming}</b><span>personnes confirmées</span></div>
        <div className="stat"><b>{declined}</b><span>foyers absents</span></div>
        <div className="stat"><b>{pending}</b><span>foyers sans réponse</span></div>
      </div>

      <h2>Ajouter un foyer</h2>
      {erreur && <p className="error">{erreur}</p>}
      <form action={addHousehold} className="row">
        <label htmlFor="displayName">Nom affiché<input id="displayName" name="displayName" placeholder="Famille Ilunga" required /></label>
        <label htmlFor="phone">WhatsApp<input id="phone" name="phone" placeholder="07 00 00 00 00" /></label>
        <label htmlFor="seats">Places<input id="seats" name="seats" type="number" min={1} max={20} defaultValue={2} style={{ width: 80 }} /></label>
        <label htmlFor="tableId">Table
          <select id="tableId" name="tableId" defaultValue="">
            <option value="">À attribuer</option>
            {tables.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.seats_assigned}/{t.capacity})</option>)}
          </select>
        </label>
        <button className="abtn" type="submit">Ajouter (code créé automatiquement)</button>
      </form>

      <h2>Invités</h2>
      <div className="tbl"><table>
        <thead><tr><th>Foyer</th><th>Code</th><th>Places</th><th>Table</th><th>Réponse</th><th>Régime</th><th>WhatsApp</th></tr></thead>
        <tbody>
          {guests.map((g) => {
            const msg = g.status === "pending" && g.invitation_sent_at
              ? reminderMessage({ displayName: g.display_name, code: g.code }, site)
              : invitationMessage({ displayName: g.display_name, code: g.code, seats: g.seats }, site);
            return (
              <tr key={g.id}>
                <td>{g.display_name}{g.message && <div style={{ color: "#5b6172", fontSize: 13 }}>« {g.message} »</div>}</td>
                <td><code>{g.code}</code></td>
                <td>{g.status === "attending" ? `${g.guest_count}/${g.seats}` : g.seats}</td>
                <td>{g.table_name ?? "—"}</td>
                <td><span className={`pill ${g.status}`}>{statusLabel[g.status]}</span></td>
                <td>{g.diet && g.diet !== "none" ? dietLabels[g.diet] : "—"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <a className="abtn wa" href={whatsappUrl(g.phone, msg)} target="_blank" rel="noreferrer">
                    {g.status === "pending" && g.invitation_sent_at ? "Relancer" : "Envoyer"}
                  </a>{" "}
                  {!g.invitation_sent_at && (
                    <form action={markSent} className="inline"><input type="hidden" name="id" value={g.id} /><button className="abtn light" type="submit">Marquer envoyé</button></form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>

      <h2>Tables</h2>
      <div className="stats">
        {tables.map((t) => (
          <div className="stat" key={t.id}><b>{t.guests_confirmed}<span style={{ fontSize: 14 }}> / {t.capacity}</span></b><span>{t.name} · {t.seats_assigned} places attribuées</span></div>
        ))}
      </div>
    </div></main>
  );
}
