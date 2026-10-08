/**
 * Página /distribuidores — puerto de la clase Component de Distribuidores v2.dc.html:
 * mapa interactivo + panel lateral con un solo estado (o resultados de búsqueda) +
 * rail de chips + entrada "fling" del mapa + scrub de los círculos orbit.
 */
import distribuidoresData from '../data/distribuidores.json';

interface Distribuidor {
	nombre: string | null;
	ciudad: string;
	porConfirmar?: boolean;
}
interface EstadoData {
	isoId: string;
	nombre: string;
	distribuidores: Distribuidor[];
}

function normalize(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();
}

function init(): void {
	const panel = document.querySelector<HTMLElement>('[data-panel]');
	const panelHeading = document.querySelector<HTMLElement>('[data-panel-heading]');
	const panelSub = document.querySelector<HTMLElement>('[data-panel-sub]');
	const panelItems = document.querySelector<HTMLElement>('[data-panel-items]');
	const panelLink = document.querySelector<HTMLAnchorElement>('[data-panel-link]');
	const panelCta = document.querySelector<HTMLElement>('[data-panel-cta]');
	const panelCtaText = document.querySelector<HTMLElement>('[data-panel-cta-text]');
	const searchInput = document.querySelector<HTMLInputElement>('[data-q]');
	const clearBtn = document.querySelector<HTMLButtonElement>('[data-clear]');
	const hoverLabel = document.querySelector<HTMLElement>('[data-hover-label]');
	const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-chip]'));
	const mapSvg = document.querySelector<SVGSVGElement>('[data-map]');
	if (!panel || !panelHeading || !panelSub || !panelItems || !mapSvg) return;
	// Vincular a constantes no-nulas: TS no propaga el guard de arriba dentro de los
	// closures que se definen más abajo.
	const panelHeadingEl = panelHeading;
	const panelSubEl = panelSub;
	const panelItemsEl = panelItems;

	const estados = distribuidoresData.estados as EstadoData[];
	const NAMES = new Map(estados.map((e) => [e.isoId, e.nombre]));
	const DIST = new Map(estados.map((e) => [e.isoId, e.distribuidores]));

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let motion: typeof import('./motion') | null = null;

	const state = { sel: 'VE-A', hover: null as string | null, q: '' };

	function buildPanelItemsHTML(items: { name: string; meta: string }[]): string {
		return items
			.map(
				(it) => `<div class="panel-item" data-panel-item>
					<div class="panel-item-name">${escapeHtml(it.name)}</div>
					<div class="panel-item-meta">${escapeHtml(it.meta)}</div>
				</div>`
			)
			.join('');
	}

	function escapeHtml(s: string): string {
		const div = document.createElement('div');
		div.textContent = s;
		return div.innerHTML;
	}

	function renderPanel(): void {
		const q = state.q.trim();
		if (q) {
			const nq = normalize(q);
			const matches: { name: string; meta: string }[] = [];
			estados.forEach((e) => {
				e.distribuidores.forEach((d) => {
					const name = d.porConfirmar ? 'Distribuidor autorizado' : d.nombre || '';
					const haystack = normalize(`${name} ${d.ciudad} ${e.nombre}`);
					if (haystack.includes(nq)) matches.push({ name, meta: `${d.ciudad} · ${e.nombre}` });
				});
			});
			panelHeadingEl.textContent = 'Resultados';
			panelSubEl.textContent = `${matches.length} coincidencia${matches.length === 1 ? '' : 's'} para “${q}”`;
			if (matches.length) {
				panelItemsEl.innerHTML = buildPanelItemsHTML(matches);
			} else {
				panelItemsEl.innerHTML = `<div class="panel-empty">No encontramos distribuidores con ese nombre o ciudad. Prueba con el nombre del estado o escríbenos.</div>`;
			}
			if (panelCta) panelCta.hidden = true;
		} else {
			const nombre = NAMES.get(state.sel) ?? '';
			const dist = DIST.get(state.sel) ?? [];
			panelHeadingEl.textContent = nombre;
			panelSubEl.textContent = `${dist.length} ${dist.length === 1 ? 'distribuidor autorizado' : 'distribuidores autorizados'}`;
			panelItemsEl.innerHTML = buildPanelItemsHTML(
				dist.map((d) => ({ name: d.porConfirmar ? 'Distribuidor autorizado' : d.nombre || '', meta: d.ciudad }))
			);
			if (panelCta) panelCta.hidden = false;
			if (panelCtaText) panelCtaText.textContent = `¿Eres de ${nombre} y quieres ser distribuidor?`;
			if (panelLink) {
				const msg = `Hola Ecopack, quiero ser distribuidor en ${nombre}.`;
				panelLink.href = `${panelLink.dataset.wa}?text=${encodeURIComponent(msg)}`;
			}
		}
	}

	async function animatePanel(): Promise<void> {
		if (reduceMotion) return;
		motion ??= await import('./motion');
		const { gsap, ensureRegistered } = motion;
		ensureRegistered();
		const title = document.querySelector('[data-panel-title]');
		if (title) {
			gsap.fromTo(
				title,
				{ clipPath: 'inset(-30% 100% -10% 0%)', x: -30 },
				{ clipPath: 'inset(-30% 0% -10% 0%)', x: 0, duration: 0.8, ease: 'expo.out', overwrite: true, clearProps: 'clipPath,transform' }
			);
		}
		const items = document.querySelectorAll('[data-panel-item]');
		if (items.length) {
			gsap.fromTo(
				items,
				{ x: 90, skewX: -14, opacity: 0 },
				{ x: 0, skewX: 0, opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.1, ease: 'expo.out', overwrite: true }
			);
		}
	}

	function updateChips(): void {
		const hasQuery = state.q.trim().length > 0;
		chips.forEach((chip) => {
			const on = !hasQuery && chip.dataset.chip === state.sel;
			chip.classList.toggle('is-active', on);
		});
		if (clearBtn) clearBtn.hidden = !hasQuery;
	}

	async function animateSelection(prevSel: string): Promise<void> {
		if (reduceMotion || prevSel === state.sel) return;
		motion ??= await import('./motion');
		const { gsap, ensureRegistered } = motion;
		ensureRegistered();
		const path = mapSvg!.querySelector(`path[data-id="${state.sel}"]`);
		if (path) {
			gsap.fromTo(path, { scale: 1.25 }, { scale: 1, transformOrigin: '50% 50%', duration: 1, ease: 'elastic.out(1,.35)' });
		}
		const pin = mapSvg!.querySelector(`[data-pin="${state.sel}"]`);
		if (pin) {
			gsap.fromTo(pin, { y: -40 }, { y: 0, duration: 0.8, ease: 'bounce.out' });
		}
	}

	function updateMapClasses(): void {
		mapSvg!.querySelectorAll('.estado').forEach((el) => el.classList.toggle('is-selected', el.getAttribute('data-id') === state.sel));
		mapSvg!.querySelectorAll('.pin-group').forEach((el) => el.classList.toggle('is-selected', el.getAttribute('data-pin') === state.sel));
	}

	function scrollPanelIntoViewIfNeeded(): void {
		const r = panel!.getBoundingClientRect();
		if (r.top < 80 || r.top > window.innerHeight * 0.45) {
			window.scrollTo({ top: r.top + window.scrollY - 88, behavior: reduceMotion ? 'auto' : 'smooth' });
		}
	}

	function select(id: string, opts: { scroll?: boolean } = {}): void {
		const prevSel = state.sel;
		state.sel = id;
		state.q = '';
		if (searchInput) searchInput.value = '';
		renderPanel();
		updateChips();
		updateMapClasses();
		animatePanel();
		animateSelection(prevSel);
		if (opts.scroll) scrollPanelIntoViewIfNeeded();
	}

	// --- Mapa: click / teclado / hover ---
	mapSvg.querySelectorAll<SVGPathElement>('path.is-covered').forEach((path) => {
		const id = path.dataset.id!;
		path.addEventListener('click', () => select(id, { scroll: true }));
		path.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				select(id, { scroll: true });
			}
		});
		path.addEventListener('mouseenter', () => {
			state.hover = id;
			if (hoverLabel) hoverLabel.textContent = `${NAMES.get(id)} · ${(DIST.get(id) ?? []).length}`;
		});
		path.addEventListener('focus', () => {
			if (hoverLabel) hoverLabel.textContent = `${NAMES.get(id)} · ${(DIST.get(id) ?? []).length}`;
		});
	});
	// Los pines agrandan el área clicable de estados pequeños (Distrito Capital,
	// Nueva Esparta) donde el path real es demasiado diminuto para tocarlo con precisión.
	mapSvg.querySelectorAll<SVGGElement>('[data-pin]').forEach((pin) => {
		const id = pin.dataset.pin!;
		pin.addEventListener('click', () => select(id, { scroll: true }));
		pin.addEventListener('mouseenter', () => {
			state.hover = id;
			if (hoverLabel) hoverLabel.textContent = `${NAMES.get(id)} · ${(DIST.get(id) ?? []).length}`;
		});
	});
	mapSvg.querySelectorAll<SVGPathElement>('path.estado:not(.is-covered)').forEach((path) => {
		path.addEventListener('mouseenter', () => {
			if (hoverLabel) hoverLabel.textContent = `${path.dataset.id ? NAMES.get(path.dataset.id) ?? '' : ''} · próximamente`.trim();
		});
	});
	mapSvg.addEventListener('mouseleave', () => {
		state.hover = null;
		if (hoverLabel) hoverLabel.textContent = 'Selecciona tu estado';
	});

	// --- Chips ---
	chips.forEach((chip) => chip.addEventListener('click', () => select(chip.dataset.chip!, { scroll: true })));

	// --- Búsqueda ---
	searchInput?.addEventListener('input', () => {
		state.q = searchInput.value;
		renderPanel();
		updateChips();
		animatePanel();
	});
	clearBtn?.addEventListener('click', () => {
		state.q = '';
		if (searchInput) searchInput.value = '';
		renderPanel();
		updateChips();
		animatePanel();
		searchInput?.focus();
	});

	updateMapClasses();

	// --- Entrada del mapa + del panel ---
	if (!reduceMotion) {
		import('./motion').then(async (mod) => {
			motion = mod;
			const { gsap, ensureRegistered } = mod;
			ensureRegistered();
			const R = gsap.utils.random;
			gsap.fromTo(
				mapSvg.querySelectorAll('.estado'),
				{ x: () => R(-500, 500), y: () => R(-340, 340), rotate: () => R(-140, 140), scale: () => R(0.3, 1.6), opacity: 0, transformOrigin: '50% 50%' },
				{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1.7, stagger: { each: 0.03, from: 'random' }, ease: 'expo.out' }
			);
			gsap.fromTo(
				mapSvg.querySelectorAll('.pin-group'),
				{ y: -120, opacity: 0 },
				{ y: 0, opacity: 1, duration: 1, stagger: 0.05, delay: 1.2, ease: 'bounce.out' }
			);
			animatePanel();

			// Círculos orbit de la sección "sé distribuidor": rotación scrubbed con el scroll.
			document.querySelectorAll<HTMLElement>('[data-orbit]').forEach((el, i) => {
				gsap.fromTo(
					el,
					{ scale: 0.5, rotate: 0 },
					{ scale: 1.2, rotate: i ? -60 : 60, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }
				);
			});

			// El h1 tiene una entrada especial (sin ScrollTrigger, ya está en pantalla al cargar);
			// el resto de data-split (el h2 de "sé distribuidor") usa el flujo normal de headings().
			const { EcoMotion } = mod;
			const h1 = document.querySelector<HTMLElement>('h1[data-split]');
			if (h1) {
				gsap.fromTo(
					EcoMotion.split(h1),
					{ yPercent: 130, rotate: 10 },
					{ yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.06, ease: 'expo.out' }
				);
				h1.removeAttribute('data-split');
			}
			EcoMotion.headings();
			// En móvil el cta-box ("Lleva envases sostenibles a tu zona") queda visible
			// sin animación: el gesto de scale/clip no se aprecia bien en pantallas chicas.
			if (!window.matchMedia('(max-width: 900px)').matches) {
				document.querySelectorAll<HTMLElement>('[data-box]').forEach((el) => {
					const finalRadius = getComputedStyle(el).borderRadius;
					EcoMotion.ft(
						el,
						{ scale: 0.82, y: 120, borderRadius: '120px' },
						{ scale: 1, y: 0, borderRadius: finalRadius, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
					);
				});
			}
			// data-fade en lote (no uno por uno): stagger real entre todos, sin ScrollTrigger
			// porque están sobre el pliegue (igual que introPage() en el mockup).
			gsap.fromTo(
				document.querySelectorAll('[data-fade]'),
				{ y: 40, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.9, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
			);
			gsap.fromTo(
				'[data-rail] button',
				{ y: 30, opacity: 0, scale: 0.8 },
				{ y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.03, delay: 0.6, ease: 'back.out(2)' }
			);
			document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
				const target = Number(el.dataset.count);
				const o = { v: 0 };
				gsap.to(o, { v: target, duration: 2, delay: 0.5, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v))) });
			});
		});
	}

}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

export {};
