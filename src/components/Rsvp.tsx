"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import type { Diet, GuestView } from "@/lib/types";
import { motionOn } from "@/lib/motion";

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

/** Avion en papier qui emporte la réponse, du bouton d'envoi jusqu'en haut du bloc. */
function flyPlane(box: HTMLElement, from: HTMLElement, form: HTMLElement): Promise<void> {
  const fl = box.querySelector<SVGSVGElement>(".flight"), fp = box.querySelector<SVGPathElement>(".flight path"), pl = box.querySelector<HTMLElement>(".plane");
  if (!fl || !fp || !pl) return Promise.resolve();
  const w = box.clientWidth, h = box.clientHeight, br = from.getBoundingClientRect(), bx = box.getBoundingClientRect();
  const x0 = br.left - bx.left + br.width / 2, y0 = br.top - bx.top + br.height / 2;
  fl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  fp.setAttribute("d", `M${x0} ${y0} C ${w * 0.05} ${y0 - 60}, ${w * 0.02} ${h * 0.3}, ${w * 0.45} ${h * 0.42} S ${w * 1.02} ${h * 0.45}, ${w * 0.85} ${h * 0.2} S ${w * 0.55} ${h * 0.02}, ${w * 0.5} ${h * 0.12}`);
  const path = anime.path(fp);
  return anime.timeline({ easing: "easeInOutSine" })
    .add({ targets: form, opacity: [1, 0.25], scale: [1, 0.96], duration: 350, easing: "easeOutQuad" })
    .add({ targets: pl, opacity: [0, 1], scale: [0.3, 1.2], duration: 250 }, "-=200")
    .add({ targets: fp, opacity: [0, 0.8], duration: 1 }, "-=100")
    .add({ targets: pl, translateX: path("x"), translateY: path("y"), rotate: path("angle"), duration: 1700, easing: "easeInOutQuad" })
    .add({ targets: [pl, fp], opacity: 0, scale: [1, 0], duration: 300, easing: "easeInBack" })
    .finished.then(() => { form.style.opacity = ""; form.style.transform = ""; pl.style.transform = ""; });
}

/** Pétales qui jaillissent quand la table apparaît. */
function burst(box: HTMLElement) {
  for (let i = 0; i < 28; i++) {
    const b = document.createElement("i");
    b.className = "burst";
    const a = Math.random() * 6.28, d = 90 + Math.random() * 170;
    b.style.setProperty("--x", Math.cos(a) * d + "px");
    b.style.setProperty("--y", Math.sin(a) * d - 40 + "px");
    b.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
    box.appendChild(b);
    setTimeout(() => b.remove(), 1500);
  }
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
  const [shake, setShake] = useState(0);
  const [animate, setAnimate] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sendBtn = useRef<HTMLButtonElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const celebrate = useRef(false);

  function go(next: Step) {
    setAnimate(motionOn());
    setStep(next);
  }

  // Table dévoilée : éclats de pétales, tables qui apparaissent autour de la sienne, nom qui rebondit
  useEffect(() => {
    if (step !== "done" || !celebrate.current || !box.current) return;
    celebrate.current = false;
    if (!motionOn()) return;
    const root = box.current;
    burst(root);
    const gs = Array.from(root.querySelectorAll(".map g"));
    const idx = Math.max(0, gs.findIndex((g) => g.classList.contains("me")));
    anime({ targets: gs, scale: [0, 1], opacity: [0, 1], delay: anime.stagger(110, { from: idx, start: 700 }), easing: "easeOutBack", duration: 700 });
    anime({ targets: root.querySelector(".tname"), scale: [0.2, 1], rotate: [-10, 0], opacity: [0, 1], delay: 450, easing: "spring(1, 80, 9, 0)" });
  }, [step]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const g = await post<GuestView>("/api/rsvp/lookup", { code });
      setGuest(g);
      setCode(code.toUpperCase().replace(/[^A-Z0-9]/g, ""));
      setAttending(g.rsvp?.attending ?? true);
      setCount(g.rsvp?.attending ? g.rsvp.guestCount : g.seats);
      setDiet(g.rsvp?.diet ?? "none");
      setMessage(g.rsvp?.message ?? "");
      go(g.rsvp ? "done" : "form");
    } catch (err) {
      setError((err as Error).message);
      if (motionOn()) setShake((n) => n + 1);
    } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const g = await post<GuestView>("/api/rsvp", { code, attending, guestCount: attending ? count : 0, diet, message });
      if (attending && motionOn() && box.current && sendBtn.current && formRef.current) {
        await flyPlane(box.current, sendBtn.current, formRef.current);
      }
      setGuest(g);
      celebrate.current = Boolean(g.rsvp?.attending && g.table);
      go("done");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  const enter = animate ? " enter" : "";
  let body: React.ReactNode;

  if (step === "code" || !guest) {
    body = (
      <form className={"form" + enter} key="code" onSubmit={lookup} noValidate>
        <p className="hint">Entrez le code à 6 caractères reçu par WhatsApp.</p>
        <label htmlFor="code">Votre code d&apos;invitation
          <input id="code" ref={codeInput} key={shake} className={"inp code" + (shake ? " shake" : "")} value={code} onChange={(e) => setCode(e.target.value)}
            maxLength={8} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="K7M4PQ"
            aria-invalid={Boolean(error)} aria-describedby={error ? "code-err" : undefined} />
        </label>
        {error && <p className="err" id="code-err" role="alert">{error}</p>}
        <button className="s-btn" type="submit" disabled={busy}>{busy ? "Vérification…" : "Continuer"}</button>
      </form>
    );
  } else if (step === "form") {
    body = (
      <form className={"form" + enter} key="form" ref={formRef} onSubmit={submit} noValidate>
        <p className="hint">Bonjour,</p>
        <p className="guest">{guest.displayName}</p>
        <p className="hint">{guest.seats > 1 ? `${guest.seats} places sont réservées pour vous.` : "Une place est réservée pour vous."}</p>
        <div className="choice" role="radiogroup" aria-label="Présence">
          <div><input type="radio" name="att" id="att-y" checked={attending} onChange={() => setAttending(true)} /><label htmlFor="att-y">Je serai là</label></div>
          <div><input type="radio" name="att" id="att-n" checked={!attending} onChange={() => setAttending(false)} /><label htmlFor="att-n">Je ne pourrai pas venir</label></div>
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
          <textarea id="msg" className="inp" rows={3} maxLength={1000} value={message} placeholder="Félicitations !" onChange={(e) => setMessage(e.target.value)} />
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="s-btn" type="submit" ref={sendBtn} disabled={busy || guest.deadlinePassed}>{busy ? "Envoi…" : "Envoyer ma réponse"}</button>
        {guest.deadlinePassed && <p className="hint">Les réponses sont closes. Écrivez aux mariés sur WhatsApp.</p>}
        <button className="s-btn ghost" type="button" onClick={() => { setCode(""); setGuest(null); go("code"); setTimeout(() => codeInput.current?.focus(), 0); }}>Ce n&apos;est pas mon code</button>
      </form>
    );
  } else {
    const r = guest.rsvp;
    body = (
      <div className={"form done" + enter} key="done" aria-live="polite">
        <p className="guest">{r?.attending ? "Merci, c'est noté !" : "Merci de nous avoir prévenus"}</p>
        {r?.attending && (
          guest.table ? (
            <>
              <div className="tcard"><small>Votre table</small><span className="tname">{guest.table.name}</span><span className="tsub">{r.guestCount} {r.guestCount > 1 ? "places" : "place"} · {guest.displayName}</span></div>
              <TableMap layout={guest.table.layout} mine={guest.table.name} />
            </>
          ) : <p className="hint">Votre table vous sera dévoilée bientôt. Revenez avec votre code.</p>
        )}
        <p className="hint">{r?.attending ? "Gardez votre code : il vous sera demandé à l'entrée de la soirée." : "Vous nous manquerez. Votre mot sera transmis aux mariés."}</p>
        {!guest.deadlinePassed && <button className="s-btn ghost" type="button" onClick={() => go("form")}>Modifier ma réponse</button>}
      </div>
    );
  }

  return (
    <div ref={box} style={{ position: "relative" }}>
      <svg className="flight" aria-hidden="true"><path d="" /></svg>
      <div className="plane" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 12 L22 3 L15 21 L11 13 Z" fill="#f4e7d0" /><path d="M11 13 L22 3" stroke="#0b1533" strokeWidth="1" /></svg></div>
      {body}
    </div>
  );
}

type Layout = NonNullable<GuestView["table"]>["layout"];

function TableMap({ layout, mine }: { layout: Layout; mine: string }) {
  return (
    <svg className="map" viewBox="0 0 320 210" role="img" aria-label={`Plan de la salle, votre table : ${mine}`}>
      <rect x="4" y="4" width="312" height="176" rx="12" className="floor" />
      <rect x="120" y="12" width="80" height="22" rx="4" className="floor" />
      <text x="160" y="27" textAnchor="middle">Piste de danse</text>
      {layout.filter((t) => t.pos_x !== null && t.pos_y !== null).map((t) => (
        <g key={t.id} className={t.name === mine ? "me" : ""}>
          {t.name === mine && <circle cx={t.pos_x!} cy={t.pos_y!} r="24" className="halo" />}
          <circle cx={t.pos_x!} cy={t.pos_y!} r="24" className="tb" />
          <text x={t.pos_x!} y={t.pos_y! + 3} textAnchor="middle">{t.name}</text>
        </g>
      ))}
      <path d="M0 196 Q 20 188 40 196 T 80 196 T 120 196 T 160 196 T 200 196 T 240 196 T 280 196 T 320 196" className="water" />
      <text x="160" y="208" textAnchor="middle">Golfe de Guinée</text>
    </svg>
  );
}
