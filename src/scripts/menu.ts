/**
 * Menú móvil: revelación circular (vía motion.ts/GSAP) desde el botón hamburguesa,
 * focus trap, Escape para cerrar, bloqueo de scroll del body.
 * Progressive enhancement — el botón de menú sólo se muestra por CSS una vez que JS
 * confirma que puede manejar el panel (ver el fallback noscript del Header).
 */
function initMenu(): void {
	const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
	const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
	if (!toggle || !panel || !closeBtn) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let lastFocused: HTMLElement | null = null;
	let motionMod: typeof import('./motion') | null = null;

	const focusablesOf = (root: HTMLElement) =>
		Array.from(
			root.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
			)
		);

	const open = async () => {
		lastFocused = document.activeElement as HTMLElement;
		panel.hidden = false;
		document.body.style.overflow = 'hidden';
		toggle.setAttribute('aria-expanded', 'true');

		if (reduceMotion) {
			panel.classList.add('is-open');
		} else {
			motionMod ??= await import('./motion');
			motionMod.EcoMotion.menu(true);
		}
		closeBtn.focus();
	};

	const close = () => {
		document.body.style.overflow = '';
		toggle.setAttribute('aria-expanded', 'false');

		if (reduceMotion || !motionMod) {
			panel.classList.remove('is-open');
			panel.hidden = true;
		} else {
			motionMod.EcoMotion.menu(false);
			window.setTimeout(() => {
				panel.hidden = true;
			}, 600);
		}
		lastFocused?.focus();
	};

	toggle.addEventListener('click', open);
	closeBtn.addEventListener('click', close);

	panel.addEventListener('click', (e) => {
		if ((e.target as HTMLElement).closest('a')) close();
	});

	document.addEventListener('keydown', (e) => {
		if (panel.hidden) return;
		if (e.key === 'Escape') {
			close();
			return;
		}
		if (e.key !== 'Tab') return;
		const focusables = focusablesOf(panel);
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 900 && !panel.hidden) close();
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initMenu);
} else {
	initMenu();
}

export {};
