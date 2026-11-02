"use client";

import { useState } from "react";
import type { Diet, GuestView } from "@/lib/types";

const dietLabels: Record<Diet, string> = {
  none: "Aucune restriction",
  vegetarian: "Végétarien",
  no_pork: "Sans porc",
  no_seafood: "Sans poisson ni fruits de mer",
  allergy: "Allergie (précisez dans le mot)",
};

type Step = "code" | "form" | "done";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ error: "Réponse illisible du serveur." }));
  if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue. Réessayez.");
  return data as T;
}

export function Rsvp({ initialCode = "" }: { initialCode?: string }) {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState(initialCode);
  const [guest, setGuest] = useState<GuestView | null>(null);
  const [attending, setAttending] = useState(true);
  const [count, setCount] = useState(1);
  const [diet, setDiet] = useState<Diet>("none");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const g = await post<GuestView>("/api/rsvp/lookup", { code });
      setGuest(g);
      setAttending(g.rsvp?.attending ?? true);
      setCount(g.rsvp?.attending ? g.rsvp.guestCount : g.seats);
      setDiet(g.rsvp?.diet ?? "none");
      setMessage(g.rsvp?.message ?? "");
      setStep(g.rsvp ? "done" : "form");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const g = await post<GuestView>("/api/rsvp", { code, attending, guestCount: attending ? count : 0, diet, message });
      setGuest(g); setStep("done");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  if (step === "code" || !guest) {
    return (
      <form className="form" onSubmit={lookup} noValidate>
        <p className="hint">Entrez le code à 6 caractères reçu par WhatsApp.</p>
        <label htmlFor="code">Votre code d&apos;invitation
          <input id="code" className="inp code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={8} autoComplete="off" placeholder="K7M4PQ" />
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Vérification…" : "Continuer"}</button>
      </form>
    );
  }

  if (step === "form") {
    return (
      <form className="form" onSubmit={submit} noValidate>
        <p className="hint">Bonjour,</p>
        <p className="guest">{guest.displayName}</p>
        <p className="hint">{guest.seats > 1 ? `${guest.seats} places sont réservées pour vous.` : "Une place est réservée pour vous."}</p>
        <div className="choice" role="radiogroup" aria-label="Présence">
          <label className={attending ? "on" : ""}><input type="radio" name="att" checked={attending} onChange={() => setAttending(true)} /> Je serai là</label>
          <label className={!attending ? "on" : ""}><input type="radio" name="att" checked={!attending} onChange={() => setAttending(false)} /> Je ne pourrai pas venir</label>
        </div>
        {attending && (
          <>
            <label htmlFor="nb">Nombre de personnes
              <select id="nb" className="inp" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {Array.from({ length: guest.seats }, (_, i) => guest.seats - i).map((n) => (
                  <option key={n} value={n}>{n} {n > 1 ? "personnes" : "personne"}</option>
                ))}
              </select>
            </label>
            <label htmlFor="diet">Régime alimentaire
              <select id="diet" className="inp" value={diet} onChange={(e) => setDiet(e.target.value as Diet)}>
                {(Object.keys(dietLabels) as Diet[]).map((d) => <option key={d} value={d}>{dietLabels[d]}</option>)}
              </select>
            </label>
          </>
        )}
        <label htmlFor="msg">Un mot pour les mariés (facultatif)
          <textarea id="msg" className="inp" rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy || guest.deadlinePassed}>{busy ? "Envoi…" : "Envoyer ma réponse"}</button>
        {guest.deadlinePassed && <p className="hint">Les réponses sont closes. Écrivez aux mariés sur WhatsApp.</p>}
      </form>
    );
  }

  const r = guest.rsvp;
  return (
    <div className="form done">
      <p className="guest">{r?.attending ? "Merci, c'est noté !" : "Merci de nous avoir prévenus"}</p>
      {r?.attending && (
        guest.table ? (
          <>
            <div className="tcard"><small>Votre table</small><span className="tname">{guest.table.name}</span><span>{r.guestCount} {r.guestCount > 1 ? "places" : "place"} · {guest.displayName}</span></div>
            <TableMap layout={guest.table.layout} mine={guest.table.name} />
          </>
        ) : <p className="hint">Votre table vous sera dévoilée bientôt. Revenez avec votre code.</p>
      )}
      <p className="hint">{r?.attending ? "Gardez votre code : il vous sera demandé à l'entrée de la soirée." : "Vous nous manquerez."}</p>
      {!guest.deadlinePassed && <button className="btn ghost" type="button" onClick={() => setStep("form")}>Modifier ma réponse</button>}
    </div>
  );
}

function TableMap({ layout, mine }: { layout: GuestView["table"] extends infer T ? T extends { layout: infer L } ? L : never : never; mine: string }) {
  return (
    <svg className="map" viewBox="0 0 320 210" role="img" aria-label={`Plan de la salle, votre table : ${mine}`}>
      <rect x="4" y="4" width="312" height="176" rx="12" className="floor" />
      <rect x="120" y="12" width="80" height="22" rx="4" className="floor" />
      <text x="160" y="27" textAnchor="middle">Piste de danse</text>
      {layout.filter((t) => t.pos_x !== null && t.pos_y !== null).map((t) => (
        <g key={t.id} className={t.name === mine ? "me" : ""}>
          <circle cx={t.pos_x!} cy={t.pos_y!} r="24" className="tb" />
          <text x={t.pos_x!} y={t.pos_y! + 3} textAnchor="middle">{t.name}</text>
        </g>
      ))}
      <path d="M0 196 Q 20 188 40 196 T 80 196 T 120 196 T 160 196 T 200 196 T 240 196 T 280 196 T 320 196" className="water" />
      <text x="160" y="208" textAnchor="middle">Golfe de Guinée</text>
    </svg>
  );
}
