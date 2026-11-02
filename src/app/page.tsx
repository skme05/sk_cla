import type { CSSProperties, ReactNode } from "react";
import { wedding, courseTabs } from "@/content/wedding";
import { sketchSymbols, dishFor } from "@/content/illustrations";
import { Rsvp } from "@/components/Rsvp";
import { SiteMotion } from "@/components/SiteMotion";
import { getMenu } from "@/lib/repo";
import { env } from "@/lib/env";
import type { Course, MenuItem } from "@/lib/types";
import "./site.css";

export const dynamic = "force-dynamic";

async function loadMenu(): Promise<MenuItem[] | null> {
  if (!env.isConfigured) return null;
  try { return await getMenu(); } catch (e) { console.error("Menu indisponible", e); return null; }
}

/** Variables CSS en ligne (--i, --t…), que le type CSSProperties ne connaît pas. */
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Titre découpé mot par mot pour l'animation d'entrée (.split .wd). */
function SplitTitle({ plain, em, className = "h split" }: { plain: string; em: string; className?: string }) {
  let k = 0;
  const words = (text: string) =>
    text.split(/(\s+)/).filter(Boolean).map((w, i) => (/^\s+$/.test(w) ? w : <span className="wd" style={v({ "--k": k++ })} key={i}>{w}</span>));
  return <h2 className={className}>{words(plain)} <em>{words(em)}</em></h2>;
}

/** Prénoms lettre par lettre (.names .l). */
function Letters({ word, from }: { word: string; from: number }) {
  return <span className="w">{[...word].map((c, i) => <span className="l" style={v({ "--i": from + i })} key={i}>{c}</span>)}</span>;
}

function Leaf({ small, par, style }: { small?: boolean; par: number; style: CSSProperties }) {
  return <svg className={small ? "leaf sm" : "leaf"} data-par={par} style={style} aria-hidden="true"><use href="#leaf" /></svg>;
}

function Sketch({ id }: { id: string }) {
  return <svg className="sk" viewBox="0 0 300 190" aria-hidden="true"><use href={`#${id}`} /></svg>;
}

function Marquee({ items, alt }: { items: readonly string[]; alt?: boolean }) {
  const line = (
    <span>
      {items.map((t) => (
        <span key={t} style={{ padding: 0 }}>
          {t.includes(" & ") ? <>{t.split(" & ")[0]} <em>&amp;</em> {t.split(" & ")[1]}</> : t} <b>✦</b>{" "}
        </span>
      ))}
    </span>
  );
  return <div className={alt ? "marq alt" : "marq"} aria-hidden="true"><div className="mq-track">{line}{line}{line}{line}</div></div>;
}

const WAVE = "M2 14 q3 -4 6 0 t6 0 t6 0 M2 19 q3 -4 6 0 t6 0 t6 0";
const GULL = "M0 6 Q 6 0 12 6 Q 18 0 24 6";
const FROND = (
  <>
    <path d="M104 112 C 70 80, 30 78, 2 100 C 34 92, 70 96, 104 112Z" /><path d="M104 112 C 80 70, 50 50, 20 54 C 50 66, 78 86, 104 112Z" />
    <path d="M104 112 C 110 70, 100 40, 80 18 C 96 50, 100 80, 104 112Z" /><path d="M104 112 C 130 74, 166 64, 196 80 C 166 78, 134 92, 104 112Z" />
    <path d="M104 112 C 142 100, 176 112, 194 140 C 168 120, 136 116, 104 112Z" /><path d="M104 112 C 70 112, 40 132, 26 162 C 48 136, 76 122, 104 112Z" />
    <circle cx="104" cy="116" r="7" />
  </>
);
const infoIcons: Record<string, ReactNode> = {
  tenue: <><path d="M16 4 L22 10 L16 28 L10 10Z" /><path d="M10 10 H22" /></>,
  lieu: <><path d="M16 29 C 16 29 6 19 6 12 a10 10 0 0 1 20 0 C 26 19 16 29 16 29Z" /><circle cx="16" cy="12" r="3.5" /></>,
  cadeau: <><rect x="5" y="12" width="22" height="16" rx="2" /><path d="M3 12 H29 V8 H3Z M16 8 V28 M16 8 C 12 2 8 4 10 8 M16 8 C 20 2 24 4 22 8" /></>,
};
const EMBLEM = Array.from({ length: 72 }, (_, i) => {
  const t = (2 * Math.PI * i) / 72, r = 36 + 5 * Math.cos(12 * t);
  return `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`;
}).join(" ");

export default async function Home({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const menu = await loadMenu();
  const { couple } = wedding;
  const courses = menu ? (Object.keys(courseTabs) as Course[]).filter((k) => menu.some((m) => m.course === k)) : [];

  return (
    <>
      <noscript><style>{".loader{display:none!important}"}</style></noscript>
      <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('gc-open'))document.documentElement.classList.add('gc-seen');if(localStorage.getItem('gc-still'))document.documentElement.classList.add('gc-still')}catch(e){}" }} />
      <style>{".gc-seen .loader{display:none!important}"}</style>

      {/* Loader « Ouvrir l'invitation » : hors de .site (container-type piégerait position:fixed) */}
      <div className="loader" id="loader" role="dialog" aria-label="Invitation">
        <div className="ld-grid" id="ldgrid" aria-hidden="true" />
        <button className="ld-sound" id="ldsound" type="button" aria-pressed="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={WAVE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span id="ldsoundtxt">Vagues activées</span>
        </button>
        <svg className="ld-mono" viewBox="0 0 320 130" aria-hidden="true"><text x="160" y="92" textAnchor="middle">{couple.first[0]} &amp; {couple.second[0]}</text></svg>
        <div className="ld-date">{wedding.shortDate}</div>
        <svg className="ld-wave" viewBox="0 0 200 20" aria-hidden="true"><path id="ldw" pathLength={1} d="M0 10 Q 12.5 0 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10" /></svg>
        <p className="ld-tap" id="ldtap" hidden>Touchez l&apos;écran pour entendre la mer</p>
        <div className="ld-pct" aria-hidden="true"><span id="ldp">0</span> %</div>
        <div className="ld-enter" id="ldenter" hidden>
          <button className="ld-btn" id="ldopen" type="button">Ouvrir l&apos;invitation</button>
        </div>
        <div className="ld-place">Grand-Bassam · Côte d&apos;Ivoire</div>
      </div>

      <div className="site" id="site">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: sketchSymbols }} />

        <nav className="s-nav" id="snav" aria-label="Sections">
          <span className="s-mono">{couple.first[0]}<b>&amp;</b>{couple.second[0]}</span>
          <button className="snd" id="snd" type="button" aria-pressed="false" title="Bruit des vagues">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={WAVE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 3 v7 M15 5 v3 M9 5 v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="bars" /></svg>
            <span>Vagues</span>
          </button>
          <div className="s-links"><a href="#mot">Invitation</a><a href="#histoire">Histoire</a><a href="#prog">Programme</a><a href="#menu">Menu</a><a href="#lieu">Le lieu</a><a href="#infos">Infos</a><a href="#mer">La mer</a></div>
          <a className="s-cta" href="#rsvp">Confirmer</a>
          <span className="progress" id="pbar" />
        </nav>

        <header className="hero" id="hero">
          <div className="stars" id="stars"><i className="shoot" style={v({ "--t": "1s", "--x": "20%", "--y": "6%" })} /><i className="shoot" style={v({ "--t": "5.5s", "--x": "60%", "--y": "2%" })} /></div>
          <div className="gulls" aria-hidden="true">
            {[["0s", "14%", 1], ["-7s", "22%", 0.7], ["-13s", "9%", 0.85], ["-18s", "30%", 0.6]].map(([t, y, s]) => (
              <svg className="gull" viewBox="0 0 24 10" style={v({ "--t": t, "--y": y, "--s": s })} key={String(t)}><path d={GULL} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            ))}
          </div>
          <canvas className="petals" id="petals" aria-hidden="true" />
          <div className="hero-txt" id="htxt">
            <div className="kicker" id="kick">{wedding.kicker}</div>
            <h1 className="names" id="names" aria-label={`${couple.first} et ${couple.second}`} title="Touchez nos prénoms">
              <Letters word={couple.first} from={0} /><span className="amp">&amp;</span><Letters word={couple.second} from={couple.first.length} />
            </h1>
            <div className="date">{wedding.dateLabel}</div>
            <div className="place">{wedding.place}</div>
            <div className="count" role="timer" aria-label="Compte à rebours avant la cérémonie" data-target={wedding.date}>
              <div><b id="cd-d">—</b><small>jours</small></div>
              <div><b id="cd-h">—</b><small>heures</small></div>
              <div><b id="cd-m">—</b><small>min</small></div>
              <div><b id="cd-s">—</b><small>sec</small></div>
            </div>
            <a className="s-cta" href="#rsvp">Confirmer ma présence</a>
          </div>
          <div className="horizon">
            <svg className="palm l" id="palmL" viewBox="0 0 200 320" aria-hidden="true"><path d="M104 112 C 92 180, 96 250, 92 320" stroke="currentColor" strokeWidth="9" fill="none" /><g className="sway" fill="currentColor">{FROND}</g></svg>
            <svg className="palm r" id="palmR" viewBox="0 0 200 320" aria-hidden="true"><path d="M104 112 C 92 180, 96 250, 92 320" stroke="currentColor" strokeWidth="9" fill="none" /><g className="sway" fill="currentColor">{FROND}</g></svg>
            <div className="sun-wrap" id="sunw"><div className="rays" /><div className="sun" /></div>
            <div className="flies" id="flies" aria-hidden="true" />
            <div className="sea">
              <svg className="wave w1" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 75 4 150 30 T 300 30 T 450 30 T 600 30 V60 H0Z" /></svg>
              <svg className="wave w2" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 75 10 150 30 T 300 30 T 450 30 T 600 30 V60 H0Z" /></svg>
              <div className="glint" aria-hidden="true"><i style={v({ "--t": "0s" })} /><i style={v({ "--t": ".4s", margin: "0 18px" })} /><i style={v({ "--t": ".8s", margin: "0 34px" })} /></div>
              <svg className="wave w3" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 75 16 150 30 T 300 30 T 450 30 T 600 30 V60 H0Z" /></svg>
            </div>
          </div>
        </header>

        <Marquee items={wedding.marquees[0]} />

        <section id="mot">
          <Leaf par={0.35} style={{ right: -40, top: 10 }} /><Leaf small par={-0.2} style={{ left: -30, bottom: 20 }} />
          <div className="in">
            <svg className="sep rv" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 7 Q 15 0 30 7 T 60 7 T 90 7 T 120 7" /></svg>
            <div className="letter-wrap">
              <svg className="bottle" viewBox="0 0 80 160" aria-hidden="true"><rect x="31" y="4" width="18" height="10" rx="2" fill="#8a5a3c" /><path d="M33 14 h14 v26 c0 8 18 16 18 34 v70 c0 8 -6 12 -12 12 h-26 c-6 0 -12 -4 -12 -12 v-70 c0 -18 18 -26 18 -34Z" fill="rgba(160,200,230,.18)" stroke="currentColor" strokeWidth="2" /><rect x="26" y="78" width="28" height="52" rx="4" fill="#f4e7d0" transform="rotate(-6 40 104)" /><path d="M30 92 h20 M30 100 h18 M30 108 h20 M30 116 h14" stroke="#e0303f" strokeWidth="1.5" transform="rotate(-6 40 104)" /></svg>
              <div className="letter rv">
                <h2 className="lbl">Notre mot d&apos;invitation</h2>
                <p className="fam">{wedding.families} ont la grande joie de vous annoncer le mariage de leurs enfants</p>
                {wedding.invitation.map((p) => <p key={p}>{p}</p>)}
                <svg className="emblem" viewBox="-60 -60 120 120" aria-hidden="true"><polygon id="morph" points={EMBLEM} /></svg>
                <div className="sign">{couple.first} &amp; {couple.second}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="histoire" className="hs">
          <div className="hs-sticky" id="hss">
            <div className="hs-head"><span className="lbl">Notre histoire</span><SplitTitle plain="De la première rencontre" em="au oui" /></div>
            <div className="hs-track" id="track">
              {wedding.story.map((s) => (
                <article className="chap" key={s.year}>
                  <figure className="skf">
                    {s.photo ? <img className="sk" src={s.photo} alt="" loading="lazy" style={{ objectFit: "cover" }} /> : <><Sketch id={s.sketch} /><figcaption>Esquisse · photo à venir</figcaption></>}
                  </figure>
                  <span className="yr">{s.year}</span><h3>{s.title}</h3><p>{s.text}</p>
                </article>
              ))}
            </div>
            <div className="hs-dots" aria-hidden="true">{wedding.story.map((s) => <i key={s.year} />)}</div>
          </div>
        </section>

        <section id="prog">
          <Leaf par={0.3} style={{ left: -50, top: 40 }} />
          <svg className="boat" id="boat" viewBox="-4 -24 100 64" aria-hidden="true"><g className="bob"><path d="M44 20 L44 -20 L74 16Z" fill="#e0303f" /><path d="M42 20 L42 -8 L22 16Z" fill="#f4e7d0" opacity=".8" /><path d="M0 20 Q 45 34 92 20 L 85 29 Q 45 38 7 29Z" fill="#060c22" stroke="#f4e7d0" strokeOpacity=".3" /></g></svg>
          <div className="boatsea" aria-hidden="true" />
          <div className="in">
            <span className="lbl rv">Programme</span>
            <SplitTitle plain="Un week-end" em="les pieds dans le sable" />
            <div className="days">
              {wedding.program.map((d, di) => (
                <div className="day rv" style={v({ "--i": di + 1 })} key={d.day}>
                  <h3>{d.day}</h3>
                  <div className="tl rv">
                    {d.events.map((e, ei) => (
                      <div className={"ev" + ("highlight" in e && e.highlight ? " hi" : "")} style={v({ "--e": ei })} key={e.time + e.title}>
                        <time>{e.time}</time><div><strong>{e.title}</strong><span>{e.place}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="menu">
          <Leaf small par={0.3} style={{ left: -20, top: 40 }} />
          <div className="in">
            <span className="lbl rv">Le menu</span>
            <SplitTitle plain="À table," em="sous la paillote" />
            {menu === null ? (
              <p className="notice">Le menu s&apos;affichera ici une fois la base de données reliée.</p>
            ) : (
              <>
                {courses.length > 1 && (
                  <div className="mtabs" id="mtabs" role="group" aria-label="Filtrer le menu">
                    <button type="button" data-f="all" aria-pressed="true">Tout</button>
                    {courses.map((k) => <button type="button" data-f={k} aria-pressed="false" key={k}>{courseTabs[k]}</button>)}
                  </div>
                )}
                <div className="dishes" id="dishes">
                  {menu.map((m) => {
                    const art = dishFor(m.name);
                    return (
                      <article className="dcard" data-cat={m.course} key={m.id}>
                        <div className="dimg">
                          {m.image_url ? <img src={m.image_url} alt={m.name} loading="lazy" /> : (
                            <>
                              {art.steam && <div className="steam" aria-hidden="true"><i /><i /><i /></div>}
                              <svg className="dish" viewBox="-50 -50 100 100" aria-hidden="true" dangerouslySetInnerHTML={{ __html: art.svg }} />
                            </>
                          )}
                        </div>
                        <div className="dtxt">
                          <span className="dcourse">{courseTabs[m.course as Course]}</span>
                          <h3>{m.name}</h3>
                          {m.description && <p>{m.description}</p>}
                          {m.tags.map((t) => <span className="dtag" key={t}>{t}</span>)}
                        </div>
                      </article>
                    );
                  })}
                </div>
                {menu.some((m) => !m.image_url) && <p className="sk-note">Illustrations provisoires · les photos des plats viendront après la dégustation chez le traiteur</p>}
              </>
            )}
          </div>
        </section>

        <section id="lieu">
          <Leaf small par={0.3} style={{ right: -20, top: 30 }} />
          <div className="in">
            <span className="lbl rv">Le lieu</span>
            <SplitTitle plain="Grand-Bassam," em="entre mer et lagune" />
            <p className="lieu-intro rv">{wedding.venue.intro}</p>
            <div className="gal">
              {wedding.venue.places.map((p, i) => (
                <figure className={"gcard rv" + (i === 0 ? " big" : "")} style={v({ "--i": i === 0 ? 0 : ((i - 1) % 2) + 1 })} key={p.title}>
                  {p.photo ? <img className="sk" src={p.photo} alt="" loading="lazy" style={{ objectFit: "cover" }} /> : <Sketch id={p.sketch} />}
                  <figcaption><b>{p.title}</b><span>{p.text}</span></figcaption>
                </figure>
              ))}
            </div>
            <p className="sk-note rv">Esquisses provisoires · elles seront remplacées par les photos du lieu</p>
          </div>
        </section>

        <Marquee items={wedding.marquees[1]} alt />

        <section id="infos">
          <Leaf par={-0.3} style={{ right: -40, top: 30 }} />
          <div className="in">
            <span className="lbl rv">Infos pratiques</span>
            <SplitTitle plain="Avant de" em="venir" />
            <div className="cards">
              {wedding.infos.map((i, n) => (
                <div className="card rv" style={v({ "--i": n + 1 })} key={i.title}>
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{infoIcons[i.icon]}</svg>
                  <h3>{i.title}</h3><p>{i.text}</p>
                  {"swatches" in i && <div className="sw">{i.swatches.map((c) => <i style={{ background: c }} key={c} />)}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="mer" className="mer">
          <div className="in">
            <span className="lbl rv">La mer vous attend</span>
            <SplitTitle plain="Touchez" em="l'eau" />
          </div>
          <div className="mer-grid" id="mergrid" aria-hidden="true" />
          <p className="mer-hint" aria-hidden="true">Touchez un point pour faire une vague</p>
        </section>

        <section id="rsvp">
          <div className="lanterns" id="lanterns" aria-hidden="true" />
          <Leaf par={0.25} style={{ left: -40, top: 60 }} /><Leaf small par={-0.25} style={{ right: -20, bottom: 40 }} />
          <div className="in" id="rsvp-in">
            <span className="lbl rv">Confirmation</span>
            <SplitTitle plain="Serez-vous" em="des nôtres ?" />
            <Rsvp initialCode={c ?? ""} />
          </div>
        </section>

        <footer className="foot">
          <div className="foot-wave">
            <svg className="wave w1" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 75 4 150 30 T 300 30 T 450 30 T 600 30 V60 H0Z" /></svg>
            <svg className="wave w3" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 75 14 150 30 T 300 30 T 450 30 T 600 30 V60 H0Z" /></svg>
          </div>
          <svg className="rings" id="rings" viewBox="0 0 120 70" aria-hidden="true"><circle cx="46" cy="40" r="22" /><circle cx="74" cy="40" r="22" /><path className="gem" d="M46 12 L52 6 L58 12 L52 18 Z" transform="translate(-6 -2)" /></svg>
          <svg className="pen" viewBox="0 0 320 90" aria-hidden="true"><text x="160" y="64" textAnchor="middle">À très vite</text></svg>
          Une question ? Écrivez à {wedding.contact.name} sur WhatsApp : {wedding.contact.phone}<br />
          <b>{wedding.hashtag}</b><br />
          <button className="motion-tog" id="motiontog" type="button" aria-pressed="false">Réduire les animations</button>
        </footer>
      </div>
      <SiteMotion />
    </>
  );
}
