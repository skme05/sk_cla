// Moteur d'animations du site public, porté de docs/maquette.html.
// Code impératif volontaire : il anime le balisage statique rendu par le serveur (page.tsx).
// Le parcours de confirmation (Rsvp.tsx) gère ses propres animations.
import anime from "animejs";
import { liteDevice } from "./motion";

type Cleanup = () => void;

export function startSiteMotion(): Cleanup {
  const maybeSite = document.getElementById("site");
  if (!maybeSite) return () => {};
  const site: HTMLElement = maybeSite;
  const $ = <T extends Element = HTMLElement>(id: string) => document.getElementById(id) as unknown as T | null;
  const all = <T extends Element = HTMLElement>(sel: string, root: ParentNode = site) => Array.from(root.querySelectorAll<T>(sel));

  // ---------- Infrastructure : tout ce qui est créé ici est défait au démontage ----------
  const cleanups: Cleanup[] = [];
  let alive = true;
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget | null, ev: K | string, fn: (e: never) => void, opts?: AddEventListenerOptions | boolean) => {
    if (!el) return;
    el.addEventListener(ev, fn as EventListener, opts);
    cleanups.push(() => el.removeEventListener(ev, fn as EventListener, opts));
  };
  const every = (fn: () => void, ms: number) => { const id = window.setInterval(fn, ms); cleanups.push(() => clearInterval(id)); };
  const later = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); };
  const loop = (fn: () => void) => { const step = () => { if (!alive) return; fn(); requestAnimationFrame(step); }; requestAnimationFrame(step); };
  const observe = (cb: IntersectionObserverCallback, opts: IntersectionObserverInit, els: Element[]) => {
    const io = new IntersectionObserver(cb, opts); els.forEach((e) => io.observe(e)); cleanups.push(() => io.disconnect()); return io;
  };
  const resize = (cb: () => void, el: Element) => { const ro = new ResizeObserver(cb); ro.observe(el); cleanups.push(() => ro.disconnect()); };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

  // ---------- Préférences : système, choix de l'invité, appareil modeste ----------
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lite = liteDevice();
  const html = document.documentElement;
  if (html.classList.contains("gc-still")) site.classList.add("still");
  let motion = !reduceMq.matches && !site.classList.contains("still");
  const motionTog = $<HTMLButtonElement>("motiontog");
  const syncMotionTog = () => {
    if (!motionTog) return;
    motionTog.setAttribute("aria-pressed", motion ? "false" : "true");
    motionTog.textContent = motion ? "Réduire les animations" : "Réactiver les animations";
    motionTog.hidden = reduceMq.matches;
  };
  syncMotionTog();
  on(motionTog, "click", () => {
    motion = !motion;
    site.classList.toggle("still", !motion);
    try { if (motion) localStorage.removeItem("gc-still"); else localStorage.setItem("gc-still", "1"); } catch {}
    if (!motion) { clearPetals(); anime.running.slice().forEach((a) => a.pause()); }
    syncMotionTog(); layout();
  });
  on(reduceMq, "change", () => { motion = !reduceMq.matches && !site.classList.contains("still"); syncMotionTog(); layout(); });

  // Liens internes : défilement doux seulement si les animations sont permises
  on(site, "click", (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const t = document.querySelector(a.getAttribute("href")!);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", a.getAttribute("href"));
  });

  // ---------- Étoiles, lucioles, lanternes ----------
  const stars = $("stars");
  if (stars) for (let i = 0; i < (lite ? 30 : 70); i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 55 + "%";
    s.style.setProperty("--d", 2 + Math.random() * 4 + "s"); s.style.setProperty("--t", -Math.random() * 5 + "s");
    if (Math.random() < 0.15) s.style.width = s.style.height = "3px";
    stars.appendChild(s);
  }
  const flies = $("flies");
  if (flies) for (let f = 0; f < (lite ? 6 : 16); f++) {
    const fi = document.createElement("i");
    fi.style.cssText = `--b:${rnd(60, 200)}px;--l:${rnd(2, 98)}%;--d:${rnd(5, 10)}s;--t:${-rnd(0, 10)}s;--dx:${rnd(-30, 30)}px`;
    flies.appendChild(fi);
  }
  const lan = $("lanterns");
  if (lan) for (let q = 0; q < (lite ? 4 : 10); q++) {
    const li = document.createElement("i");
    li.style.cssText = `--l:${rnd(3, 95)}%;--s:${rnd(0.6, 1.4)};--d:${rnd(16, 28)}s;--t:${-rnd(0, 28)}s`;
    lan.appendChild(li);
  }

  // ---------- Compte à rebours ----------
  const target = new Date(site.querySelector<HTMLElement>(".count")?.dataset.target ?? "2027-02-13T16:30:00Z").getTime();
  const prev: Record<string, string> = {};
  let counting = false;
  const set = (id: string, val: string) => {
    const el = $(id); if (!el || prev[id] === val) return;
    el.textContent = val;
    if (prev[id] !== undefined && motion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    prev[id] = val;
  };
  const tick = () => {
    const d = Math.max(0, target - Date.now());
    if (!counting) set("cd-d", String(Math.floor(d / 864e5)));
    set("cd-h", String(Math.floor(d / 36e5) % 24).padStart(2, "0"));
    set("cd-m", String(Math.floor(d / 6e4) % 60).padStart(2, "0"));
    set("cd-s", String(Math.floor(d / 1e3) % 60).padStart(2, "0"));
  };
  tick(); every(tick, 1000);

  // ---------- Pétales d'hibiscus (canvas) ----------
  const hero = $("hero")!;
  const cv = $<HTMLCanvasElement>("petals");
  const cx = cv?.getContext("2d") ?? null;
  type Petal = { x: number; y: number; s: number; vy: number; vx: number; a: number; va: number; ph: number; c: string };
  let W = 0, H = 0, heroVisible = true;
  const P: Petal[] = [];
  const dpr = Math.min(lite ? 1 : 2, window.devicePixelRatio || 1);
  function sizeCanvas() { if (!cv || !cx) return; const r = hero.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  const mk = (top: boolean): Petal => ({ x: Math.random() * W, y: top ? Math.random() * H : -20, s: 5 + Math.random() * 7, vy: 0.35 + Math.random() * 0.6, vx: -0.3 + Math.random() * 0.6, a: Math.random() * 6.28, va: -0.02 + Math.random() * 0.04, ph: Math.random() * 6.28, c: Math.random() < 0.75 ? "#e0303f" : "#ff7a63" });
  function clearPetals() { cx?.clearRect(0, 0, W, H); }
  if (cv && cx) {
    sizeCanvas();
    for (let j = 0; j < (lite ? 10 : 22); j++) P.push(mk(true));
    resize(sizeCanvas, hero);
    observe((es) => { heroVisible = es[0].isIntersecting; }, {}, [hero]);
    loop(() => {
      if (!motion || !heroVisible) return;
      cx.clearRect(0, 0, W, H);
      P.forEach((p, ix) => {
        p.ph += 0.02; p.x += p.vx + Math.sin(p.ph) * 0.5; p.y += p.vy; p.a += p.va;
        if (p.y > H + 20) P[ix] = mk(false);
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a);
        cx.globalAlpha = 0.85; cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.28); cx.fill();
        cx.globalAlpha = 0.35; cx.fillStyle = "#fff"; cx.beginPath(); cx.ellipse(-p.s * 0.3, 0, p.s * 0.35, p.s * 0.15, 0, 0, 6.28); cx.fill();
        cx.restore();
      });
    });
  }

  // ---------- Révélations au défilement (l'élément reste visible au repos) ----------
  const reveal = (sel: string, opts: IntersectionObserverInit, extra?: (el: Element) => void) => {
    const io = observe((es) => es.forEach((e) => {
      if (e.isIntersecting && motion) { e.target.classList.add("on"); io.unobserve(e.target); extra?.(e.target); }
    }), opts, all(sel));
  };
  site.classList.add("ajs");
  all(".gcard").forEach((g) => g.classList.remove("rv")); // la galerie a son entrée anime.js
  reveal(".rv", { threshold: 0.2 });
  reveal(".split", { threshold: 0.3 }, (h) => anime({
    targets: h.querySelectorAll(".wd"), translateY: ["90%", 0], rotate: [anime.stagger([-12, 12]), 0], opacity: [0, 1],
    delay: anime.stagger(90), duration: 1400, easing: "easeOutElastic(1, .6)",
  }));
  reveal(".sk, .pen", { rootMargin: "0px 0px 10% 0px", threshold: 0.01 });

  // ---------- Défilement : parallaxe du hero, histoire horizontale, pirogue, barre de progression ----------
  const nav = $("snav")!, pbar = $("pbar"), htxt = $("htxt"), sunw = $("sunw"), pl = $("palmL"), pr = $("palmR");
  const hs = $("histoire"), hss = $("hss"), track = $("track"), prog = $("prog"), boat = $("boat");
  const dots = hs ? all("i", hs.querySelector(".hs-dots")!) : [];
  const leaves = lite ? [] : all<SVGElement>("[data-par]");
  let dist = 0, ticking = false;
  const pinnable = () => motion && !reduceMq.matches;
  function layout() {
    const vh = window.innerHeight, nh = nav.offsetHeight;
    site!.style.setProperty("--vph", vh + "px"); site!.style.setProperty("--navh", nh + "px");
    html.style.setProperty("--navh", nh + "px");
    if (hs && hss && track) { dist = Math.max(0, track.scrollWidth - hss.clientWidth); hs.style.height = pinnable() ? vh - nh + dist + "px" : ""; }
    onScroll();
  }
  const moving = [htxt, sunw, pl, pr, stars, track, boat, ...leaves].filter(Boolean) as (HTMLElement | SVGElement)[];
  function onScroll() {
    ticking = false;
    const st = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
    if (pbar) pbar.style.transform = `scaleX(${max > 0 ? st / max : 0})`;
    if (!motion) { moving.forEach((e) => { e.style.transform = ""; e.style.opacity = ""; }); dots.forEach((d, i) => d.classList.toggle("act", i === 0)); return; }
    const p = clamp(st / hero.offsetHeight);
    if (htxt) { htxt.style.transform = `translateY(${-p * 90}px) scale(${1 - p * 0.08})`; htxt.style.opacity = String(1 - p * 1.15); }
    if (sunw) sunw.style.transform = `translateY(${p * 150}px) scale(${1 + p * 0.35})`;
    if (pl) pl.style.transform = `translateX(${-p * 90}px) rotate(${-p * 10}deg)`;
    if (pr) pr.style.transform = `translateX(${p * 90}px) scaleX(-1) rotate(${-p * 10}deg)`;
    if (stars) stars.style.transform = `translateY(${p * 60}px)`;
    leaves.forEach((l) => {
      const r = (l.parentNode as Element).getBoundingClientRect(), d = r.top + r.height / 2 - vh / 2;
      l.style.transform = `translateY(${d * parseFloat(l.dataset.par ?? "0")}px) rotate(${d * 0.03}deg)`;
    });
    if (hs && track) {
      const top = hs.getBoundingClientRect().top;
      const hp = dist ? clamp((nav.offsetHeight - top) / dist) : 0;
      track.style.transform = `translateX(${-hp * dist}px)`;
      const ai = Math.round(hp * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle("act", i === ai));
    }
    if (prog && boat) {
      const r2 = prog.getBoundingClientRect(), t = clamp((vh - r2.top) / (r2.height + vh));
      boat.style.transform = `translateX(${t * (r2.width + 140) - 130}px)`;
    }
  }
  on(window, "scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  on(window, "resize", layout);
  resize(layout, site);
  layout();

  // ---------- Bandeaux défilants liés à la vitesse du défilement ----------
  const mqs = all(".marq").map((m, i) => ({ el: m.querySelector<HTMLElement>(".mq-track")!, x: 0, dir: i % 2 ? 1 : -1 }));
  let lastSt = window.scrollY, vel = 0, sign = 1;
  loop(() => {
    const st = window.scrollY, dv = st - lastSt; lastSt = st;
    if (dv) sign = dv > 0 ? 1 : -1;
    vel = vel * 0.88 + dv * 0.12;
    mqs.forEach((m) => {
      if (!motion) { m.el.style.transform = ""; return; }
      const half = m.el.scrollWidth / 2;
      m.x += m.dir * sign * (0.6 + Math.min(14, Math.abs(vel) * 0.5));
      if (m.x <= -half) m.x += half;
      if (m.x > 0) m.x -= half;
      const sk = Math.max(-10, Math.min(10, -vel * 0.4));
      m.el.style.transform = `translateX(${m.x}px) skewX(${sk}deg)`;
    });
  });

  // ---------- Souris : pétales, cartes 3D, boutons aimantés ; toucher : ondes ----------
  if (!lite) {
    let lastT = 0;
    const at = (e: PointerEvent, cls: string) => {
      const r = site.getBoundingClientRect(), d = document.createElement("i");
      d.className = cls; d.style.left = e.clientX - r.left + "px"; d.style.top = e.clientY - r.top + "px"; return d;
    };
    on(site, "pointermove", (e: PointerEvent) => {
      if (!motion || e.pointerType !== "mouse") return;
      const now = performance.now(); if (now - lastT < 45) return; lastT = now;
      const d = at(e, "trail"); d.style.setProperty("--r", rnd(0, 360) + "deg"); d.style.setProperty("--dx", rnd(-30, 30) + "px");
      site.appendChild(d); setTimeout(() => d.remove(), 1150);
    });
    on(site, "pointerdown", (e: PointerEvent) => {
      if (!motion || e.pointerType === "mouse") return;
      const d = at(e, "ripple"); site.appendChild(d); setTimeout(() => d.remove(), 850);
    });
    all(".gcard,.card,.chap").forEach((c) => {
      on(c, "pointermove", (e: PointerEvent) => {
        if (!motion || e.pointerType !== "mouse") return;
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add("tilt"); c.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      on(c, "pointerleave", () => { c.style.transform = ""; setTimeout(() => c.classList.remove("tilt"), 200); });
    });
    all(".s-cta").forEach((b) => {
      on(b, "pointermove", (e: PointerEvent) => {
        if (!motion || e.pointerType !== "mouse") return;
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      on(b, "pointerleave", () => { b.style.transform = ""; });
    });
  }

  // ---------- Prénoms : entrée à l'ouverture, explosion au toucher ----------
  const names = $("names");
  if (names) {
    names.style.cursor = "pointer";
    on(names, "click", () => {
      if (!motion) return;
      const ls = names.querySelectorAll(".l");
      anime.remove(ls);
      anime.timeline()
        .add({ targets: ls, translateX: () => anime.random(-140, 140), translateY: () => anime.random(-120, 90), rotate: () => anime.random(-200, 200), scale: () => anime.random(5, 16) / 10, duration: 550, easing: "easeOutExpo" })
        .add({ targets: ls, translateX: 0, translateY: 0, rotate: 0, scale: 1, delay: anime.stagger(40, { from: "center" }), easing: "spring(1, 70, 8, 0)" });
    });
  }
  function onOpen() {
    if (!motion) return;
    anime({ targets: "#names .l", translateY: ["1.2em", 0], scale: [0.3, 1], rotate: [anime.stagger([-40, 40], { from: "center" }), 0], opacity: [0, 1], delay: anime.stagger(70, { from: "center", start: 250 }), easing: "spring(1, 70, 9, 0)" });
    anime({ targets: "#names .amp", rotate: [-180, 0], scale: [0, 1], delay: 600, duration: 1600, easing: "easeOutElastic(1, .5)" });
    const d = Math.floor(Math.max(0, target - Date.now()) / 864e5), o = { v: 0 };
    counting = true;
    anime({ targets: o, v: d, round: 1, duration: 2200, delay: 500, easing: "easeOutExpo", update: () => { const el = $("cd-d"); if (el) el.textContent = String(o.v); }, complete: () => { counting = false; prev["cd-d"] = String(d); } });
    anime({ targets: ".count div", translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(110, { start: 400 }), easing: "spring(1, 80, 12, 0)" });
  }

  // ---------- Machine à écrire ----------
  const kick = $("kick"), kickTxt = kick?.textContent ?? "";
  let kt = 0;
  cleanups.push(() => clearInterval(kt));
  function typeKick() {
    if (!kick) return;
    clearInterval(kt);
    if (!motion) { kick.textContent = kickTxt; return; }
    let i = 0; kick.textContent = ""; kick.classList.add("typing");
    kt = window.setInterval(() => {
      i++; kick.textContent = kickTxt.slice(0, i);
      if (i >= kickTxt.length) { clearInterval(kt); setTimeout(() => kick.classList.remove("typing"), 1400); }
    }, 45);
  }

  // ---------- Emblème : soleil → hibiscus → cœur → alliance ----------
  {
    const N = 72, sh: Record<string, string[]> = { sun: [], flower: [], heart: [], ring: [] };
    for (let i = 0; i < N; i++) {
      const t = (2 * Math.PI * i) / N;
      let r = 36 + 5 * Math.cos(12 * t); sh.sun.push(`${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`);
      r = 26 + 16 * Math.cos(5 * t); sh.flower.push(`${(r * Math.cos(t - Math.PI / 2)).toFixed(1)},${(r * Math.sin(t - Math.PI / 2)).toFixed(1)}`);
      const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      sh.heart.push(`${(hx * 2.5).toFixed(1)},${(hy * 2.5).toFixed(1)}`);
      r = i % 2 ? 30 : 40; const tt = (2 * Math.PI * Math.floor(i / 2)) / (N / 2);
      sh.ring.push(`${(r * Math.cos(tt)).toFixed(1)},${(r * Math.sin(tt) + 4).toFixed(1)}`);
    }
    const morph = $("morph");
    if (morph && motion) {
      const a = anime({ targets: morph, points: [{ value: sh.flower.join(" ") }, { value: sh.heart.join(" ") }, { value: sh.ring.join(" ") }, { value: sh.sun.join(" ") }], duration: 1300, delay: 1100, easing: "easeInOutQuint", loop: true });
      cleanups.push(() => a.pause());
    }
  }

  // ---------- Galerie du lieu ----------
  const gal = site.querySelector(".gal");
  if (gal) {
    const io = observe((es) => {
      if (!es[0].isIntersecting || !motion) return;
      io.disconnect();
      anime({ targets: gal.children, translateY: [80, 0], rotate: [anime.stagger([-8, 8]), 0], scale: [0.85, 1], opacity: [0, 1], delay: anime.stagger(130), duration: 1300, easing: "easeOutElastic(1, .8)" });
    }, { threshold: 0.1 }, [gal]);
  }

  // ---------- Horaires du programme qui défilent comme une horloge ----------
  {
    const io = observe((es) => es.forEach((e) => {
      if (!e.isIntersecting || !motion) return;
      io.unobserve(e.target);
      e.target.querySelectorAll("time").forEach((tm, i) => {
        const [h, m] = (tm.textContent ?? "0:0").split(":").map(Number), o = { v: 0 }, end = tm.textContent;
        anime({ targets: o, v: h * 60 + m, round: 1, duration: 1600, delay: 300 + i * 180, easing: "easeOutExpo",
          update: () => { const hh = Math.floor(o.v / 60), mm = o.v % 60; tm.textContent = `${hh < 10 ? "0" : ""}${hh}:${mm < 10 ? "0" : ""}${mm}`; },
          complete: () => { tm.textContent = end; } });
      });
    }), { threshold: 0.3 }, all(".tl"));
  }

  // ---------- La mer de points : chaque toucher lance une onde ----------
  const mg = $("mergrid");
  if (mg) {
    let mcols = 0, rippling = false, lastTouch = 0, seaVisible = false;
    const mrows = 9;
    const buildSea = () => {
      const c = Math.max(12, Math.min(32, Math.floor((mg.clientWidth - 32) / 20)));
      if (c === mcols) return;
      mcols = c; mg.innerHTML = ""; mg.style.gridTemplateColumns = `repeat(${c},1fr)`;
      for (let i = 0; i < c * mrows; i++) mg.appendChild(document.createElement("i"));
    };
    const ripple = (idx: number) => {
      if (!motion || rippling) return;
      rippling = true;
      const dts = mg.children, g: [number, number] = [mcols, mrows];
      anime.timeline({ complete: () => { rippling = false; } })
        .add({ targets: dts, translateX: anime.stagger("-.6rem", { grid: g, from: idx, axis: "x" }), translateY: anime.stagger("-.6rem", { grid: g, from: idx, axis: "y" }),
          scale: [{ value: 0.3, duration: 300, easing: "easeOutSine" }, { value: 1.6, duration: 500, easing: "easeInOutQuad" }],
          backgroundColor: [{ value: "#ff7a63", duration: 300 }, { value: "#e0303f", duration: 500 }], delay: anime.stagger(55, { grid: g, from: idx }), easing: "easeInOutQuad" })
        .add({ targets: dts, translateX: 0, translateY: 0, scale: 1, backgroundColor: (_: Element, i: number) => (i % 7 === 6 ? "#3b5bb5" : "#2c4590"), duration: 900, delay: anime.stagger(45, { grid: g, from: idx }), easing: "easeOutElastic(1, .6)" }, "-=400");
    };
    on(mg, "pointerdown", (e: PointerEvent) => {
      const r = mg.getBoundingClientRect(), cw = (r.width - 32) / mcols, ch = r.height / mrows;
      const x = Math.min(mcols - 1, Math.max(0, Math.floor((e.clientX - r.left - 16) / cw))), y = Math.min(mrows - 1, Math.max(0, Math.floor((e.clientY - r.top) / ch)));
      lastTouch = Date.now(); ripple(y * mcols + x);
    });
    buildSea(); resize(buildSea, mg);
    observe((es) => { seaVisible = es[0].isIntersecting; }, {}, [mg]);
    if (!lite) every(() => { if (seaVisible && Date.now() - lastTouch > 4000) ripple(Math.floor(Math.random() * mcols * mrows)); }, 4200);
  }

  // ---------- Alliances dessinées au trait ----------
  const rings = $<SVGSVGElement>("rings");
  if (rings) {
    const io = observe((es) => {
      if (!es[0].isIntersecting || !motion) return;
      io.disconnect();
      anime.timeline({ easing: "easeInOutSine" })
        .add({ targets: rings.querySelectorAll("circle"), strokeDashoffset: [anime.setDashoffset, 0], duration: 1400, delay: anime.stagger(350) })
        .add({ targets: rings.querySelector(".gem"), scale: [0, 1.4, 1], rotate: [0, 180], duration: 900, easing: "easeOutElastic(1, .5)" }, "-=300")
        .add({ targets: rings, rotate: [{ value: -6 }, { value: 6 }, { value: 0 }], duration: 1600 });
      const a = anime({ targets: rings.querySelector(".gem"), opacity: [1, 0.4], scale: [1, 1.25], direction: "alternate", loop: true, duration: 900, delay: 2600, easing: "easeInOutSine" });
      cleanups.push(() => a.pause());
    }, { threshold: 0.5 }, [rings]);
  }

  // ---------- Menu : onglets et assiettes qui tournent ----------
  const mtabs = $("mtabs"), dcards = all(".dcard");
  const dishIn = (list: HTMLElement[]) => {
    if (!motion || !list.length) return;
    anime({ targets: list.map((c) => c.querySelector(".plate")).filter(Boolean), rotate: [-200, 0], scale: [0.2, 1], delay: anime.stagger(90), duration: 1300, easing: "easeOutElastic(1, .7)" });
    anime({ targets: list, translateY: [40, 0], opacity: [0, 1], delay: anime.stagger(90), duration: 700, easing: "easeOutCubic" });
  };
  on(mtabs, "click", (e: MouseEvent) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button"); if (!b || !mtabs) return;
    mtabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    const f = b.dataset.f, shown: HTMLElement[] = [];
    dcards.forEach((c) => { const ok = f === "all" || c.dataset.cat === f; c.hidden = !ok; if (ok) shown.push(c); });
    dishIn(shown);
  });
  const dishes = $("dishes");
  if (dishes) { const io = observe((es) => { if (es[0].isIntersecting && motion) { io.disconnect(); dishIn(dcards); } }, { threshold: 0.1 }, [dishes]); }

  // ---------- Bruit des vagues (généré, sans fichier) ----------
  const snd = $("snd"), ldsound = $("ldsound"), ldsoundtxt = $("ldsoundtxt"), ldtap = $("ldtap");
  let ac: AudioContext | null = null, master: GainNode | null = null, soundOn = false;
  let wantSound = (() => { try { return localStorage.getItem("gc-sound") !== "0"; } catch { return true; } })();
  const remember = (v: boolean) => { try { localStorage.setItem("gc-sound", v ? "1" : "0"); } catch {} };
  function updButtons(v: boolean) {
    snd?.setAttribute("aria-pressed", v ? "true" : "false");
    ldsound?.setAttribute("aria-pressed", v ? "true" : "false");
    if (ldsoundtxt) ldsoundtxt.textContent = v ? "Vagues activées" : "Son coupé";
  }
  function setSound(v: boolean) {
    try {
      if (!ac && v) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ac = new AC();
        const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
        const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
        const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650;
        const swell = ac.createGain(); swell.gain.value = 0.55;
        const lfo = ac.createOscillator(); lfo.frequency.value = 0.11;
        const lg = ac.createGain(); lg.gain.value = 0.45; lfo.connect(lg); lg.connect(swell.gain);
        master = ac.createGain(); master.gain.value = 0;
        src.connect(lp); lp.connect(swell); swell.connect(master); master.connect(ac.destination);
        src.start(); lfo.start();
      }
      if (ac && master) { void ac.resume(); master.gain.setTargetAtTime(v ? 0.5 : 0, ac.currentTime, 0.8); }
      soundOn = v; updButtons(v);
    } catch { if (snd) snd.title = "Le son n'est pas disponible sur cet appareil"; }
  }
  cleanups.push(() => { void ac?.close(); });
  const checkTap = () => { if (ldtap) ldtap.hidden = !(wantSound && (!ac || ac.state !== "running")); };
  // Les navigateurs exigent un geste : le son démarre au premier toucher si l'invité ne l'a pas coupé
  const wake = () => {
    if (!wantSound) return;
    if (!ac || !soundOn) setSound(true); else if (ac.state !== "running") void ac.resume();
    setTimeout(checkTap, 150);
  };
  on(document, "pointerdown", wake, true);
  on(document, "keydown", wake, true);
  on(snd, "click", (e: Event) => { e.stopPropagation(); wantSound = !soundOn; remember(wantSound); setSound(wantSound); });
  on(ldsound, "click", (e: Event) => { e.stopPropagation(); wantSound = !wantSound; remember(wantSound); setSound(wantSound); setTimeout(checkTap, 150); });
  updButtons(false);

  // ---------- Loader « Ouvrir l'invitation » ----------
  const loader = $("loader"), ldp = $("ldp"), ldw = $<SVGPathElement>("ldw"), gate = $("ldenter"), pct = loader?.querySelector<HTMLElement>(".ld-pct");
  const seen = html.classList.contains("gc-seen");
  let gridAnim: anime.AnimeInstance | null = null;
  const goToHash = () => {
    const h = location.hash && document.querySelector(location.hash);
    if (h) h.scrollIntoView({ block: "start" });
  };
  function openSite() {
    try { sessionStorage.setItem("gc-open", "1"); } catch {}
    if (wantSound) setSound(true);
    if (ldtap) ldtap.hidden = true;
    loader?.classList.add("out");
    site.classList.remove("loading");
    if (motion) site.classList.add("reveal");
    typeKick(); onOpen();
    later(() => { if (loader) loader.hidden = true; gridAnim?.pause(); }, 1050);
    document.body.style.overflow = "";
    $("ldopen")?.blur();
  }
  function showGate() {
    if (!gate || !pct) return;
    gate.hidden = false; pct.hidden = true;
    $<HTMLButtonElement>("ldopen")?.focus({ preventScroll: true });
    if (motion) anime({ targets: gate.children, scale: [0.6, 1], opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(140), easing: "spring(1, 80, 10, 0)" });
  }
  function startGrid() {
    const g = $("ldgrid"); if (!g) return;
    const cols = 11, rows = 19;
    g.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    for (let i = 0; i < cols * rows; i++) g.appendChild(document.createElement("i"));
    gridAnim = anime({ targets: g.children, scale: [{ value: 0.3, duration: 500 }, { value: 1.8, duration: 700 }, { value: 0.3, duration: 800 }], opacity: [{ value: 0.15 }, { value: 0.9 }, { value: 0.15 }],
      translateY: [{ value: 0 }, { value: -6 }, { value: 0 }], delay: anime.stagger(70, { grid: [cols, rows], from: "center" }), loop: true, easing: "easeInOutSine" });
    cleanups.push(() => gridAnim?.pause());
  }
  if (!loader || seen) {
    if (loader) loader.hidden = true;
    typeKick(); onOpen();
    later(goToHash, 0);
  } else {
    document.body.style.overflow = "hidden";
    cleanups.push(() => { document.body.style.overflow = ""; });
    site.classList.add("loading");
    on($("ldopen"), "click", (e: Event) => { e.stopPropagation(); openSite(); });
    // Tentative de lecture dès le chargement : acceptée par certains navigateurs, sinon le premier toucher lance la mer
    if (wantSound) { setSound(true); later(checkTap, 400); }
    const play = () => {
      if (!alive) return;
      if (!motion) { if (ldp) ldp.textContent = "100"; if (ldw) ldw.style.strokeDashoffset = "0"; showGate(); return; }
      if (!lite) startGrid();
      loader.classList.add("go");
      const t0 = performance.now(), D = 2300;
      const step = (now: number) => {
        if (!alive) return;
        const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
        if (ldp) ldp.textContent = String(Math.round(e * 100));
        if (ldw) ldw.style.strokeDashoffset = String(1 - e);
        if (k < 1) requestAnimationFrame(step); else showGate();
      };
      requestAnimationFrame(step);
    };
    let started = false;
    const start = () => { if (!started) { started = true; play(); } };
    void document.fonts?.ready.then(start);
    later(start, 1200);
    later(goToHash, 0);
  }

  return () => {
    alive = false;
    cleanups.splice(0).reverse().forEach((f) => { try { f(); } catch {} });
  };
}
