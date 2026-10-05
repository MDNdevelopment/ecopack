/**
 * Carrusel hero — puerto exacto de `go(i)` / `playBar()` de Home v2.dc.html, usando
 * gsap real (vía motion.ts) para las curvas y el timeline de cortinas.
 *
 * La visibilidad de cada slide se controla EXCLUSIVAMENTE escribiendo
 * `el.style.visibility` desde aquí (igual que el mockup) — nunca por una regla CSS
 * permanente como `:first-child`, que fue la causa del bug de solapamiento.
 */
import type { EcoMotion as EcoMotionType } from "./motion";
import type GsapDefault from "gsap";

type Tween = ReturnType<(typeof GsapDefault)["fromTo"]>;

function initHero(): void {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
  const dots = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-dot]"),
  );
  const bars = Array.from(root.querySelectorAll<HTMLElement>("[data-bar]"));
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-hero-prev]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-hero-next]");
  const curtain1 = root.querySelector<HTMLElement>('[data-curtain="1"]');
  const curtain2 = root.querySelector<HTMLElement>('[data-curtain="2"]');
  if (!slides.length) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const DURATION = 7;
  let current = 0;
  let busy = false;
  let paused = false;
  let barTw: Tween | null = null;

  let EcoMotion: typeof EcoMotionType;
  let gsap: typeof GsapDefault;

  function swap(next: number) {
    const outEl = slides[current];
    const inEl = slides[next];
    outEl.style.visibility = "hidden";
    outEl.setAttribute("aria-hidden", "true");
    inEl.style.visibility = "visible";
    inEl.setAttribute("aria-hidden", "false");
    current = next;
    dots.forEach((d, i) => {
      if (i === current) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    playBar();
  }

  function playBar() {
    if (!gsap) return;
    bars.forEach((b, i) => {
      if (i !== current) gsap.set(b, { scaleX: i < current ? 1 : 0 });
    });
    barTw?.kill();
    const bar = bars[current];
    if (!bar) return;
    barTw = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: DURATION,
        ease: "none",
        onComplete: () => go(current + 1),
      },
    );
    if (paused) barTw.pause();
  }

  function go(i: number) {
    const n = slides.length;
    if (!n || busy) return;
    const next = ((i % n) + n) % n;
    const cur = current;
    if (next === cur) return;

    if (!gsap || reduceMotion) {
      swap(next);
      return;
    }

    const outEl = slides[cur];
    const inEl = slides[next];
    busy = true;
    barTw?.pause();

    const dir = next > cur || (cur === n - 1 && next === 0) ? 1 : -1;
    const outWords = EcoMotion.split(
      outEl.querySelector<HTMLElement>("[data-slide-h]"),
    );
    const inWords = EcoMotion.split(
      inEl.querySelector<HTMLElement>("[data-slide-h]"),
    );
    const outZoom = outEl.querySelector<HTMLElement>("[data-slide-zoom]");
    const inZoom = inEl.querySelector<HTMLElement>("[data-slide-zoom]");
    const inRest = inEl.querySelectorAll<HTMLElement>("[data-slide-rest]");

    const tl = gsap.timeline({
      onComplete: () => {
        busy = false;
      },
    });

    tl.set([curtain1, curtain2], {
      visibility: "visible",
      xPercent: -100 * dir,
    })
      .to(
        outWords,
        {
          yPercent: -120,
          rotate: -6,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.in",
        },
        0,
      )
      .to(outZoom, { scale: 0.85, duration: 0.8, ease: "power3.in" }, 0)
      .to(curtain1, { xPercent: 0, duration: 0.6, ease: "expo.inOut" }, 0.15)
      .to(curtain2, { xPercent: 0, duration: 0.6, ease: "expo.inOut" }, 0.27)
      .add(() => {
        gsap.set(inRest, { opacity: 0 });
        gsap.set(inWords, { yPercent: 130 });
        swap(next);
      })
      .set(inZoom, { scale: 1.45 })
      .set(outZoom, { scale: 1 })
      .set(outWords, { yPercent: 0, rotate: 0 })
      .to(curtain2, { xPercent: 100 * dir, duration: 0.75, ease: "expo.inOut" })
      .to(
        curtain1,
        { xPercent: 100 * dir, duration: 0.75, ease: "expo.inOut" },
        "<.1",
      )
      .to(inZoom, { scale: 1, duration: 1.8, ease: "expo.out" }, "<")
      .fromTo(
        inWords,
        { yPercent: 130, rotate: 10 * dir },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.2,
          stagger: 0.05,
          ease: "expo.out",
        },
        "<.25",
      )
      .fromTo(
        inRest,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
        "<.35",
      )
      .set([curtain1, curtain2], { visibility: "hidden" });
  }

  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  prevBtn?.addEventListener("click", () => go(current - 1));
  nextBtn?.addEventListener("click", () => go(current + 1));

  root.addEventListener("mouseenter", () => {
    // paused = true;
    // if (barTw && !busy) barTw.pause();
  });
  root.addEventListener("mouseleave", () => {
    // paused = false;
    // if (barTw && !busy) barTw.resume();
  });
  root.addEventListener("focusin", () => {
    // paused = true;
    // if (barTw && !busy) barTw.pause();
  });
  root.addEventListener("focusout", (e) => {
    // if (root.contains(e.relatedTarget as Node)) return;
    // paused = false;
    // if (barTw && !busy) barTw.resume();
  });

  // Soporte táctil básico: swipe horizontal cambia de slide.
  let touchStartX: number | null = null;
  root.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0]?.clientX ?? null;
    },
    { passive: true },
  );
  root.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchStartX = null;
  });

  // Flechas del teclado cuando el carrusel tiene el foco.
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  });

  if (reduceMotion) return; // Sin animación: slide 0 estática, sin autoplay.

  import("./motion").then((mod) => {
    gsap = mod.gsap;
    EcoMotion = mod.EcoMotion;

    const s0 = slides[0];
    const zoom0 = s0.querySelector<HTMLElement>("[data-slide-zoom]");
    gsap.fromTo(
      zoom0,
      { scale: 1.5 },
      { scale: 1, duration: 2.2, ease: "expo.out" },
    );
    gsap.fromTo(
      EcoMotion.split(s0.querySelector<HTMLElement>("[data-slide-h]")),
      { yPercent: 130, rotate: 10 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 1.3,
        stagger: 0.06,
        delay: 0.2,
        ease: "expo.out",
      },
    );
    gsap.fromTo(
      s0.querySelectorAll("[data-slide-rest]"),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.1,
        delay: 0.7,
        ease: "power3.out",
      },
    );

    playBar();
    barTw?.play();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHero);
} else {
  initHero();
}

export {};
