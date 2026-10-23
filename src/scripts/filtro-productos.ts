/**
 * Client-side filtering for the product catalog. Everything renders in the
 * initial HTML (crawlable, works with JS off); this only toggles visibility.
 * Checkboxes: OR within a group (uso / material), AND between groups and search.
 */
import { normalize } from '../lib/productos';

function initFiltros(): void {
	const root = document.querySelector<HTMLElement>('[data-filtros]');
	const families = Array.from(document.querySelectorAll<HTMLElement>('[data-familia]'));
	if (!root || !families.length) return;

	const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-grupo]'));
	const empty = document.querySelector<HTMLElement>('[data-filtro-vacio]');
	const status = document.querySelector<HTMLElement>('[data-filtro-status]');
	const activeBox = document.querySelector<HTMLElement>('[data-filtro-activos]');
	const badge = document.querySelector<HTMLElement>('[data-filtro-badge]');
	const counts = Array.from(document.querySelectorAll<HTMLElement>('[data-filtro-count]'));
	const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-filtro-search]'));
	const checks = Array.from(root.querySelectorAll<HTMLInputElement>('[data-filtro-check]'));
	const scope = root.closest<HTMLElement>('[data-catalogo]') ?? document.body;

	let q = '';

	function selected(kind: string): Set<string> {
		return new Set(checks.filter((c) => c.checked && c.dataset.filtroCheck === kind).map((c) => c.value));
	}

	function apply(): void {
		const cats = selected('categoria');
		const mats = selected('material');
		let visible = 0;
		families.forEach((fam) => {
			const ok =
				(!cats.size || cats.has(fam.dataset.categoria || '')) &&
				(!mats.size || mats.has(fam.dataset.material || '')) &&
				(!q || (fam.dataset.search || '').includes(q));
			fam.hidden = !ok;
			if (ok) visible++;
		});
		groups.forEach((g) => {
			g.hidden = !g.querySelector('[data-familia]:not([hidden])');
		});
		if (empty) empty.hidden = visible > 0;
		if (status) status.textContent = visible === families.length ? `${families.length} familias` : `${visible} de ${families.length} familias`;
		counts.forEach((el) => (el.textContent = String(visible)));

		const nChecked = cats.size + mats.size;
		if (badge) {
			badge.hidden = !nChecked;
			badge.textContent = String(nChecked);
		}
		scope.classList.toggle('has-filtros', !!(nChecked || q));
		document.dispatchEvent(new Event('catalogo:filtrado'));

		if (activeBox) {
			activeBox.replaceChildren(
				...checks
					.filter((c) => c.checked)
					.map((c) => {
						const chip = document.createElement('button');
						chip.type = 'button';
						chip.className = 'filtro-chip';
						chip.setAttribute('aria-label', `Quitar filtro ${c.dataset.label}`);
						const label = document.createElement('span');
						label.textContent = c.dataset.label || c.value;
						const x = document.createElement('b');
						x.setAttribute('aria-hidden', 'true');
						x.textContent = '✕';
						chip.append(label, x);
						chip.addEventListener('click', () => {
							c.checked = false;
							apply();
						});
						return chip;
					}),
			);
		}
	}

	// Hay dos buscadores (panel de escritorio y barra móvil): se mantienen sincronizados.
	inputs.forEach((inp) =>
		inp.addEventListener('input', () => {
			inputs.forEach((o) => o !== inp && (o.value = inp.value));
			q = normalize(inp.value.trim());
			apply();
		}),
	);

	checks.forEach((c) => c.addEventListener('change', apply));

	// Enlaces como /productos?categoria=cajas-carton llegan con el filtro ya marcado.
	const preset = new URLSearchParams(location.search).get('categoria');
	if (preset) checks.forEach((c) => c.dataset.filtroCheck === 'categoria' && c.value === preset && (c.checked = true));

	root.querySelector('[data-filtro-clear]')?.addEventListener('click', () => {
		checks.forEach((c) => (c.checked = false));
		inputs.forEach((i) => (i.value = ''));
		q = '';
		apply();
	});

	// Panel deslizable en celular / iPad vertical.
	const backdrop = document.querySelector<HTMLElement>('.f-backdrop');
	const openBtn = document.querySelector<HTMLButtonElement>('[data-filtro-open]');
	function setOpen(open: boolean): void {
		root!.classList.toggle('is-open', open);
		if (backdrop) backdrop.hidden = !open;
		openBtn?.setAttribute('aria-expanded', String(open));
		document.body.style.overflow = open ? 'hidden' : '';
		document.body.classList.toggle('filtros-open', open);
	}
	openBtn?.addEventListener('click', () => setOpen(true));
	document.querySelectorAll('[data-filtro-close]').forEach((el) => el.addEventListener('click', () => setOpen(false)));
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
	});
	// Si se pasa a escritorio con el panel abierto, se cierra para no dejar el body bloqueado.
	matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && setOpen(false));

	apply();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initFiltros);
} else {
	initFiltros();
}

export {};
