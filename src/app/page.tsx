import { wedding, courseLabels } from "@/content/wedding";
import { Rsvp } from "@/components/Rsvp";
import { getMenu } from "@/lib/repo";
import { env } from "@/lib/env";
import type { Course, MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadMenu(): Promise<MenuItem[] | null> {
  if (!env.isConfigured) return null;
  try { return await getMenu(); } catch (e) { console.error("Menu indisponible", e); return null; }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const menu = await loadMenu();
  const { couple } = wedding;

  return (
    <>
      <nav className="nav">
        <span className="mono">{couple.first[0]}<b>&amp;</b>{couple.second[0]}</span>
        <a className="cta" href="#rsvp">Confirmer</a>
      </nav>

      <header className="hero">
        <div className="wrap">
          <div className="kicker">Sous les tropiques, nous nous marions</div>
          <h1 className="names">{couple.first}<span className="amp">&amp;</span>{couple.second}</h1>
          <div className="date">{wedding.dateLabel}</div>
          <div className="place">{wedding.place}</div>
          <a className="cta" href="#rsvp">Confirmer ma présence</a>
        </div>
      </header>

      <section id="mot"><div className="wrap letter">
        <span className="lbl">Notre mot d&apos;invitation</span>
        <p className="fam">{wedding.families} ont la grande joie de vous annoncer le mariage de leurs enfants</p>
        {wedding.invitation.map((p) => <p key={p}>{p}</p>)}
        <div className="sign">{couple.first} &amp; {couple.second}</div>
      </div></section>

      <section id="programme"><div className="wrap">
        <span className="lbl">Programme</span>
        <h2 className="h">Un week-end <em>les pieds dans le sable</em></h2>
        <div className="days">
          {wedding.program.map((d) => (
            <div className="day" key={d.day}>
              <h3>{d.day}</h3>
              {d.events.map((e) => (
                <div className={"ev" + ("highlight" in e && e.highlight ? " hi" : "")} key={e.time + e.title}>
                  <time>{e.time}</time><div><strong>{e.title}</strong><span>{e.place}</span></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div></section>

      <section id="menu"><div className="wrap">
        <span className="lbl">Le menu</span>
        <h2 className="h">À table, <em>sous la paillote</em></h2>
        {menu === null ? (
          <p className="notice">Le menu s&apos;affichera ici une fois la base de données reliée.</p>
        ) : (
          <div className="grid">
            {menu.map((m) => (
              <article className="card" key={m.id}>
                {m.image_url && <img className="dishimg" src={m.image_url} alt={m.name} loading="lazy" />}
                <span className="course">{courseLabels[m.course as Course]}</span>
                <h4>{m.name}</h4>
                {m.description && <p>{m.description}</p>}
                {m.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
              </article>
            ))}
          </div>
        )}
      </div></section>

      <section id="infos"><div className="wrap">
        <span className="lbl">Infos pratiques</span>
        <h2 className="h">Avant de <em>venir</em></h2>
        <div className="grid">
          {wedding.infos.map((i) => <div className="card" key={i.title}><h4>{i.title}</h4><p>{i.text}</p></div>)}
        </div>
      </div></section>

      <section id="rsvp"><div className="wrap">
        <span className="lbl">Confirmation</span>
        <h2 className="h">Serez-vous <em>des nôtres ?</em></h2>
        <Rsvp initialCode={c ?? ""} />
      </div></section>

      <footer>
        Une question ? Écrivez à {wedding.contact.name} sur WhatsApp : {wedding.contact.phone}<br />
        <b>{wedding.hashtag}</b>
      </footer>
    </>
  );
}
