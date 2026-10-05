/**
 * Bootstrapper de animación para las páginas propias del sitio (fuera del mockup):
 * /productos, /nosotros, /contacto, /preguntas-frecuentes, /distribuidores/[estado].
 * Sólo necesitan data-fade / data-box / data-split / data-count — ver
 * `EcoMotion.wireSimple` en motion.ts.
 */
async function init(): Promise<void> {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const { ensureRegistered, EcoMotion } = await import('./motion');
	ensureRegistered();
	EcoMotion.wireSimple();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

export {};
