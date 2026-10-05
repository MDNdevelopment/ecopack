/**
 * Carrito de pedido: sin precios ni backend. Guarda las referencias elegidas en localStorage
 * y las convierte en un mensaje de WhatsApp (mismo canal que wa-form.ts).
 */
interface LineaCarrito {
	codigo: string;
	nombre: string;
	familia: string;
	empaque: string;
	foto?: string;
	cantidad: number;
}

const KEY = 'ecopack-carrito';
const MAX_CANTIDAD = 999;

function leer(): LineaCarrito[] {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
		if (!Array.isArray(raw)) return [];
		return raw.filter(
			(l) => l && typeof l.codigo === 'string' && typeof l.nombre === 'string' && Number.isInteger(l.cantidad) && l.cantidad > 0,
		);
	} catch {
		return [];
	}
}

let lineas: LineaCarrito[] = leer();

function guardar(): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(lineas));
	} catch {
		/* modo privado o almacenamiento bloqueado: el carrito vive solo en esta página */
	}
}

function initCarrito(): void {
	const panel = document.querySelector<HTMLElement>('[data-carrito-panel]');
	const backdrop = document.querySelector<HTMLElement>('[data-carrito-backdrop]');
	if (!panel || !backdrop) return;

	const lista = panel.querySelector<HTMLElement>('[data-carrito-lista]')!;
	const vacio = panel.querySelector<HTMLElement>('[data-carrito-vacio]')!;
	const acciones = panel.querySelector<HTMLElement>('[data-carrito-acciones]')!;
	const enviar = panel.querySelector<HTMLAnchorElement>('[data-carrito-enviar]')!;
	const vaciar = panel.querySelector<HTMLButtonElement>('[data-carrito-vaciar]')!;
	const cerrar = panel.querySelector<HTMLButtonElement>('[data-carrito-cerrar]')!;
	const live = document.querySelector<HTMLElement>('[data-carrito-live]');
	const telefono = panel.dataset.telefono ?? '';
	let abridor: HTMLElement | null = null;

	const totalUnidades = () => lineas.reduce((s, l) => s + l.cantidad, 0);

	function mensaje(): string {
		const filas = lineas.map((l) => `• ${l.codigo} — ${l.familia}, ${l.nombre}: ${l.cantidad} × ${l.empaque}`);
		return ['Hola Ecopack, quisiera cotizar el siguiente pedido:', filas.join('\n')].join('\n\n');
	}

	function pintarContador(): void {
		const n = totalUnidades();
		document.querySelectorAll<HTMLElement>('[data-carrito-count]').forEach((el) => {
			el.textContent = String(n);
			el.hidden = n === 0;
		});
	}

	function pintar(): void {
		pintarContador();
		lista.replaceChildren();
		const hayItems = lineas.length > 0;
		vacio.hidden = hayItems;
		acciones.hidden = !hayItems;
		if (!hayItems) return;

		for (const l of lineas) {
			const li = document.createElement('li');
			li.className = 'carrito-item';
			li.style.setProperty('--i', String(lista.children.length));

			if (l.foto) {
				const img = document.createElement('img');
				img.src = l.foto;
				img.alt = '';
				img.width = 64;
				img.height = 64;
				img.className = 'carrito-foto';
				li.append(img);
			}

			const info = document.createElement('div');
			info.className = 'carrito-info';
			const cod = document.createElement('strong');
			cod.textContent = l.codigo;
			const nom = document.createElement('span');
			nom.textContent = `${l.familia} · ${l.nombre}`;
			const emp = document.createElement('small');
			emp.textContent = `Empaque: ${l.empaque}`;
			info.append(cod, nom, emp);

			const ctrl = document.createElement('div');
			ctrl.className = 'carrito-cant';
			const menos = boton('−', `Quitar una unidad de ${l.codigo}`, 'menos', l.codigo);
			const num = document.createElement('span');
			num.className = 'carrito-num';
			num.textContent = String(l.cantidad);
			num.setAttribute('aria-label', `Cantidad: ${l.cantidad}`);
			const mas = boton('+', `Agregar una unidad de ${l.codigo}`, 'mas', l.codigo);
			const quitar = boton('✕', `Eliminar ${l.codigo} del pedido`, 'quitar', l.codigo);
			quitar.classList.add('carrito-quitar');
			ctrl.append(menos, num, mas, quitar);

			const texto = document.createElement('div');
			texto.className = 'carrito-texto';
			texto.append(info, ctrl);
			li.append(texto);
			lista.append(li);
		}

		enviar.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje())}`;
	}

	function boton(texto: string, label: string, accion: string, codigo: string): HTMLButtonElement {
		const b = document.createElement('button');
		b.type = 'button';
		b.textContent = texto;
		b.setAttribute('aria-label', label);
		b.dataset.accion = accion;
		b.dataset.codigo = codigo;
		return b;
	}

	function cambiar(): void {
		guardar();
		pintar();
	}

	const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
	let temporizadorCierre: number | undefined;

	function abrir(desde?: HTMLElement | null): void {
		window.clearTimeout(temporizadorCierre);
		panel!.classList.remove('is-closing');
		backdrop!.classList.remove('is-closing');
		if (!panel!.hidden) return;
		abridor = desde ?? (document.activeElement as HTMLElement | null);
		panel!.hidden = false;
		backdrop!.hidden = false;
		// los productos entran escalonados solo al abrir, no en cada cambio de cantidad
		panel!.classList.add('is-entrando');
		window.setTimeout(() => panel!.classList.remove('is-entrando'), 900);
		document.documentElement.classList.add('carrito-abierto');
		document.querySelectorAll('[data-carrito-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
		cerrar.focus();
	}

	function cerrarPanel(): void {
		if (panel!.hidden || panel!.classList.contains('is-closing')) return;
		document.querySelectorAll('[data-carrito-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
		abridor?.focus();

		const terminar = () => {
			panel!.hidden = true;
			backdrop!.hidden = true;
			panel!.classList.remove('is-closing');
			backdrop!.classList.remove('is-closing');
			document.documentElement.classList.remove('carrito-abierto');
		};
		if (reducirMovimiento.matches) {
			terminar();
			return;
		}
		panel!.classList.add('is-closing');
		backdrop!.classList.add('is-closing');
		temporizadorCierre = window.setTimeout(terminar, 320);
	}

	document.addEventListener('click', (e) => {
		const t = e.target as HTMLElement;

		const add = t.closest<HTMLElement>('[data-add-carrito]');
		if (add) {
			const { codigo, nombre, familia, empaque, foto } = add.dataset;
			if (!codigo || !nombre) return;
			const existente = lineas.find((l) => l.codigo === codigo);
			if (existente) existente.cantidad = Math.min(MAX_CANTIDAD, existente.cantidad + 1);
			else lineas.push({ codigo, nombre, familia: familia ?? '', empaque: empaque ?? '', foto, cantidad: 1 });
			cambiar();
			if (live) live.textContent = `${codigo} agregado al pedido. ${totalUnidades()} en total.`;
			const original = add.dataset.label ?? add.textContent ?? '';
			add.dataset.label = original;
			add.textContent = 'Agregado ✓';
			add.classList.add('is-added');
			setTimeout(() => {
				add.textContent = original;
				add.classList.remove('is-added');
			}, 1300);
			return;
		}

		const toggle = t.closest<HTMLElement>('[data-carrito-toggle]');
		if (toggle) {
			abrir(toggle);
			return;
		}

		if (t.closest('[data-carrito-cerrar]') || t === backdrop) {
			cerrarPanel();
			return;
		}

		const ctl = t.closest<HTMLButtonElement>('[data-accion]');
		if (ctl && panel.contains(ctl)) {
			const l = lineas.find((x) => x.codigo === ctl.dataset.codigo);
			if (!l) return;
			if (ctl.dataset.accion === 'mas') l.cantidad = Math.min(MAX_CANTIDAD, l.cantidad + 1);
			if (ctl.dataset.accion === 'menos') l.cantidad -= 1;
			if (ctl.dataset.accion === 'quitar') l.cantidad = 0;
			lineas = lineas.filter((x) => x.cantidad > 0);
			cambiar();
			// los botones se re-crean: devolver el foco al mismo control, o al cierre si la línea desapareció
			const mismo = lineas.length
				? lista.querySelector<HTMLElement>(`[data-accion="${ctl.dataset.accion}"][data-codigo="${CSS.escape(l.codigo)}"]`)
				: null;
			(mismo ?? cerrar).focus();
		}
	});

	vaciar.addEventListener('click', () => {
		lineas = [];
		cambiar();
		cerrar.focus();
	});

	enviar.addEventListener('click', () => {
		if (lineas.length === 0) return;
		enviar.target = '_blank';
		enviar.rel = 'noopener noreferrer';
	});

	panel.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			cerrarPanel();
			return;
		}
		if (e.key !== 'Tab') return;
		const foco = [...panel.querySelectorAll<HTMLElement>('button, a[href]')].filter((el) => !el.closest('[hidden]'));
		if (foco.length === 0) return;
		const primero = foco[0];
		const ultimo = foco[foco.length - 1];
		if (e.shiftKey && document.activeElement === primero) {
			e.preventDefault();
			ultimo.focus();
		} else if (!e.shiftKey && document.activeElement === ultimo) {
			e.preventDefault();
			primero.focus();
		}
	});

	// otra pestaña modificó el carrito
	window.addEventListener('storage', (e) => {
		if (e.key !== KEY) return;
		lineas = leer();
		pintar();
	});

	pintar();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCarrito);
} else {
	initCarrito();
}

export {};
