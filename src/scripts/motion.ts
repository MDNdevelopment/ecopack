/**
 * Puerto 1:1 de `window.EcoMotion` (motion.js) del mockup original, usando GSAP real
 * en vez de una aproximación en CSS — así las curvas (expo.out, back.out(2.6),
 * elastic.out(1,.35), bounce.out) y los timings quedan exactamente como el diseño fuente.
 *
 * Se importa dinámicamente (`await import('./motion')`) desde cada script de página,
 * después de que el HTML ya está pintado — no bloquea el primer render.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
function ensureRegistered() {
	if (!registered) {
		gsap.registerPlugin(ScrollTrigger);
		registered = true;
	}
}

declare global {
	interface HTMLElement {
		__words?: HTMLElement[];
	}
}

/** Divide el texto de `el` en palabras envueltas en spans, con memoización en `el.__words`. */
function split(el: HTMLElement | null): HTMLElement[] {
	if (!el) return [];
	if (el.__words) return el.__words;
	const words: HTMLElement[] = [];

	const walk = (node: HTMLElement) => {
		Array.from(node.childNodes).forEach((c) => {
			if (c.nodeType === 3) {
				const frag = document.createDocumentFragment();
				const text = c.textContent || '';
				text.split(/(\s+)/).forEach((part) => {
					if (!part) return;
					if (/^\s+$/.test(part)) {
						frag.appendChild(document.createTextNode(' '));
						return;
					}
					const outer = document.createElement('span');
					outer.style.cssText =
						'display:inline-block;overflow:hidden;vertical-align:bottom;padding:.4em .06em .3em;margin:-.4em -.06em -.3em';
					const inner = document.createElement('span');
					inner.style.cssText = 'display:inline-block;will-change:transform';
					inner.textContent = part;
					outer.appendChild(inner);
					frag.appendChild(outer);
					words.push(inner);
				});
				node.replaceChild(frag, c);
			} else if (c.nodeType === 1) {
				walk(c as HTMLElement);
			}
		});
	};
	walk(el);
	el.__words = words;
	return words;
}

/** gsap.fromTo con limpieza automática de props residuales cuando hay scrollTrigger. */
function ft(targets: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars): gsap.core.Tween {
	if (to.scrollTrigger) {
		const onComplete = to.onComplete;
		to.onComplete = function (this: gsap.core.Tween, ...args: unknown[]) {
			gsap.set(this.targets(), { clearProps: 'clipPath,opacity,transform' });
			if (onComplete) onComplete.apply(this, args as []);
		};
	}
	return gsap.fromTo(targets, from, to);
}

/** data-split: palabras suben desde yPercent 120 con rotación 7°, una vez, al 88% del viewport. */
function headings(scope: ParentNode = document) {
	scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
		const words = split(el);
		ft(
			words,
			{ yPercent: 170, rotate: 7 },
			{
				yPercent: 0,
				rotate: 0,
				duration: 0.9,
				stagger: 0.035,
				ease: 'expo.out',
				scrollTrigger: { trigger: el, start: 'top 96%', once: true },
			}
		);
	});
}

/** Menú móvil: panel lateral que desliza desde la derecha sobre un fondo que se oscurece. */
function menu(open: boolean) {
	const overlay = document.querySelector<HTMLElement>('[data-menu-panel]');
	const drawer = overlay?.querySelector<HTMLElement>('[data-menu-drawer]');
	if (!overlay || !drawer) return;
	document.body.style.overflow = open ? 'hidden' : '';
	gsap.killTweensOf([overlay, drawer]);

	if (open) {
		gsap.set(overlay, { visibility: 'visible' });
		gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
		gsap.fromTo(drawer, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'power3.out' });
		gsap.fromTo(
			overlay.querySelectorAll('.mobile-nav a, .mobile-menu-bottom > *'),
			{ opacity: 0, x: 24 },
			{ opacity: 1, x: 0, duration: 0.5, stagger: 0.05, delay: 0.2, ease: 'power3.out' }
		);
	} else {
		gsap.to(drawer, { xPercent: 100, duration: 0.4, ease: 'power3.in' });
		gsap.to(overlay, {
			opacity: 0,
			duration: 0.4,
			ease: 'power2.in',
			onComplete: () => gsap.set(overlay, { visibility: 'hidden' }),
		});
	}
}

/** Entrada elástica del botón de WhatsApp + anillo pulsante en loop. Devuelve los tweens (para poder matarlos). */
function whatsapp(): gsap.core.Tween[] {
	const btn = document.querySelector<HTMLElement>('[data-wa]');
	const ring = document.querySelector<HTMLElement>('[data-wa-ring]');
	const tweens: gsap.core.Tween[] = [];
	if (btn) {
		tweens.push(gsap.fromTo(btn, { scale: 0, rotate: -200 }, { scale: 1, rotate: 0, duration: 1.4, delay: 1.2, ease: 'elastic.out(1,.45)' }));
	}
	if (ring) {
		tweens.push(
			gsap.fromTo(
				ring,
				{ scale: 1, opacity: 0.6 },
				{ scale: 1.9, opacity: 0, duration: 1.8, repeat: -1, delay: 2.4, ease: 'power2.out' }
			)
		);
	}
	return tweens;
}

/**
 * Para las páginas propias del sitio (fuera del mockup: /productos, /nosotros,
 * /contacto, /preguntas-frecuentes) — sólo necesitan el
 * subconjunto fade/box/split/count, con el mismo motor que el resto del sitio.
 */
function wireSimple(scope: ParentNode = document) {
	headings(scope);

	scope.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
		const delay = el.dataset.fadeDelay ? Number(el.dataset.fadeDelay) / 1000 : 0;
		ft(
			el,
			{ y: 40, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.9, delay, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
		);
	});

	scope.querySelectorAll<HTMLElement>('[data-box]').forEach((el) => {
		const finalRadius = getComputedStyle(el).borderRadius;
		ft(
			el,
			{ scale: 0.82, y: 120, borderRadius: '120px' },
			{ scale: 1, y: 0, borderRadius: finalRadius, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
		);
	});

	scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
		const target = Number(el.dataset.count);
		const o = { v: 0 };
		gsap.to(o, {
			v: target,
			duration: 1.8,
			ease: 'power3.out',
			onUpdate: () => {
				el.textContent = String(Math.round(o.v));
			},
			scrollTrigger: { trigger: el, start: 'top 90%', once: true },
		});
	});
}

export const EcoMotion = { split, ft, headings, menu, whatsapp, wireSimple };
export { gsap, ScrollTrigger, ensureRegistered };
