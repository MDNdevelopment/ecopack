/**
 * Client-side filtering for the product catalog. Everything renders in the
 * initial HTML (crawlable, works with JS off); this only toggles visibility.
 */
function normalize(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();
}

function initFiltros(): void {
	const root = document.querySelector<HTMLElement>('[data-filtros]');
	const families = Array.from(document.querySelectorAll<HTMLElement>('[data-familia]'));
	const status = document.querySelector<HTMLElement>('[data-filtro-status]');
	const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-grupo]'));
	const empty = document.querySelector<HTMLElement>('[data-filtro-vacio]');
	if (!root || !families.length) return;

	const state = { categoria: 'todos', material: 'todos', q: '' };

	const searchInput = root.querySelector<HTMLInputElement>('[data-filtro-search]');
	const clearBtn = root.querySelector<HTMLButtonElement>('[data-filtro-clear]');

	function matches(fam: HTMLElement): boolean {
		if (state.categoria !== 'todos' && fam.dataset.categoria !== state.categoria) return false;
		if (state.material !== 'todos' && fam.dataset.material !== state.material) return false;
		if (state.q) {
			const haystack = fam.dataset.search || '';
			if (!haystack.includes(state.q)) return false;
		}
		return true;
	}

	function apply(): void {
		let visible = 0;
		families.forEach((fam) => {
			const ok = matches(fam);
			fam.hidden = !ok;
			if (ok) visible++;
		});
		groups.forEach((g) => {
			g.hidden = !g.querySelector('[data-familia]:not([hidden])');
		});
		if (empty) empty.hidden = visible > 0;
		if (status) {
			status.textContent = visible === families.length ? `Mostrando las ${families.length} familias de producto.` : `Mostrando ${visible} de ${families.length} familias.`;
		}
		if (clearBtn) clearBtn.hidden = !state.q;
	}

	root.querySelectorAll<HTMLElement>('[data-filtro-chips]').forEach((group) => {
		const key = group.dataset.filtroChips as 'categoria' | 'material';
		group.querySelectorAll<HTMLButtonElement>('button[data-filtro-value]').forEach((btn) => {
			btn.addEventListener('click', () => {
				group.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
				btn.classList.add('is-active');
				state[key] = btn.dataset.filtroValue || 'todos';
				apply();
			});
		});
	});

	searchInput?.addEventListener('input', () => {
		state.q = normalize(searchInput.value.trim());
		apply();
	});

	clearBtn?.addEventListener('click', () => {
		if (searchInput) searchInput.value = '';
		state.q = '';
		apply();
		searchInput?.focus();
	});

	apply();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initFiltros);
} else {
	initFiltros();
}

export {};
