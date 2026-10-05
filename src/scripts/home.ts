/**
 * Orquesta las animaciones de scroll/entrada de la home — puerto de `intro()` en
 * Home v2.dc.html. Se importa GSAP dinámicamente; sin JS o con `prefers-reduced-motion`
 * el contenido ya está completo y estático en el HTML (sin esperar a este script).
 */
async function init(): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const { gsap, ScrollTrigger, EcoMotion, ensureRegistered } =
    await import("./motion");
  ensureRegistered();

  document
    .querySelectorAll<HTMLElement>("[data-slide-h]")
    .forEach((h) => EcoMotion.split(h));

  EcoMotion.headings();

  document.querySelectorAll<HTMLElement>("[data-fade]").forEach((el) =>
    EcoMotion.ft(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 98%", once: true },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) =>
    EcoMotion.ft(
      Array.from(el.children),
      { rotateX: -85, y: 80, opacity: 0, transformOrigin: "50% 0%" },
      {
        rotateX: 0,
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-slam]").forEach((el) =>
    EcoMotion.ft(
      Array.from(el.children),
      { scale: 0, rotate: () => gsap.utils.random(-25, 25) },
      {
        scale: 1,
        rotate: 0,
        duration: 0.9,
        stagger: { each: 0.06, from: "random" },
        ease: "back.out(2.6)",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-box]").forEach((el) => {
    const finalRadius = getComputedStyle(el).borderRadius;
    EcoMotion.ft(
      el,
      { scale: 0.82, y: 120, borderRadius: "120px" },
      {
        scale: 1,
        y: 0,
        borderRadius: finalRadius,
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      },
    );
  });

  document.querySelectorAll<HTMLElement>("[data-skew]").forEach((el) =>
    EcoMotion.ft(
      Array.from(el.children),
      { x: 180, skewX: -18, opacity: 0 },
      {
        x: 0,
        skewX: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.14,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-shutter]").forEach((el) =>
    EcoMotion.ft(
      Array.from(el.children),
      { clipPath: "inset(100% 0% 0% 0%)", y: 60 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-wipe]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(25% 25% 25% 25% round 28px)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 28px)",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          end: "top 35%",
          scrub: 0.6,
        },
      },
    );
    const inner = el.querySelector<HTMLElement>("[data-wipe-in]");
    if (inner) {
      gsap.fromTo(
        inner,
        { scale: 1.6 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }
  });

  document.querySelectorAll<HTMLElement>("[data-scrub]").forEach((el) =>
    gsap.fromTo(
      EcoMotion.split(el),
      { opacity: 0.7, yPercent: 30 },
      {
        opacity: 1,
        yPercent: 0,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 65%",
          end: "top 45%",
          scrub: 0.5,
        },
      },
    ),
  );

  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: target,
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = String(Math.round(o.v));
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  // Mini-mapa: estados "vuelan" a su posición, luego los pines caen con bounce.
  const R = gsap.utils.random;
  const minimap = document.querySelector("[data-minimap]");
  if (minimap) {
    gsap.fromTo(
      "[data-minimap] .estado",
      {
        x: () => R(-420, 420),
        y: () => R(-300, 300),
        rotate: () => R(-120, 120),
        opacity: 0,
        transformOrigin: "50% 50%",
      },
      {
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: 1.6,
        stagger: { each: 0.025, from: "random" },
        ease: "expo.out",
        scrollTrigger: {
          trigger: "[data-minimap]",
          start: "top 85%",
          once: true,
        },
      },
    );
    gsap.fromTo(
      "[data-minimap] .pin",
      { y: -80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        delay: 1.1,
        ease: "bounce.out",
        scrollTrigger: {
          trigger: "[data-minimap]",
          start: "top 85%",
          once: true,
        },
      },
    );
  }

  ScrollTrigger.refresh();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {};
