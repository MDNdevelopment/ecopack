/**
 * Turns the contact form into a WhatsApp deep link: no backend, no spam,
 * matches the channel Ecopack already uses with customers.
 */
function initWaForm(): void {
	const form = document.querySelector<HTMLFormElement>('[data-wa-form]');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const data = new FormData(form);
		const nombre = String(data.get('nombre') || '').trim();
		const correo = String(data.get('correo') || '').trim();
		const mensaje = String(data.get('mensaje') || '').trim();

		if (!nombre || !mensaje) {
			form.reportValidity();
			return;
		}

		const lines = [
			`Hola Ecopack, soy ${nombre}.`,
			correo ? `Mi correo: ${correo}` : null,
			mensaje,
		].filter(Boolean);

		const base = form.getAttribute('action') || '';
		const url = `${base}?text=${encodeURIComponent(lines.join('\n\n'))}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initWaForm);
} else {
	initWaForm();
}

export {};
