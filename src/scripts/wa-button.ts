/**
 * Entrada elástica del botón de WhatsApp + anillo pulsante en loop, vía motion.ts/GSAP.
 * El botón ya es visible y funcional sin JS (es un <a> normal); esto sólo añade el
 * gesto de entrada y el pulso una vez que el usuario acepta animación.
 */
function init(): void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	import('./motion').then(({ EcoMotion }) => {
		EcoMotion.whatsapp();
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

export {};
