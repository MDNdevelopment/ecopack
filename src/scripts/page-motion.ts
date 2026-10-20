/**
 * Bootstrapper de animación para las páginas propias del sitio (fuera del mockup):
 * /productos, /nosotros, /contacto, /preguntas-frecuentes.
 * Sólo necesitan data-fade / data-box / data-split / data-count — ver
 * `EcoMotion.wireSimple` en motion.ts.
 */
async function init(): Promise<void> {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const { ensureRegistered, EcoMotion } = await import('./motion');
	ensureRegistered();
	EcoMotion.wireSimple();
	// El filtro de /productos oculta tarjetas y cambia la altura de la página: sin
	// recalcular, los títulos de grupo que aparecen al filtrar se quedan en opacity 0.
	const { ScrollTrigger } = await import('gsap/ScrollTrigger');
	document.addEventListener('catalogo:filtrado', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

export {};
