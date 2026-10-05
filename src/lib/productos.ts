import type { Familia } from '../data/types';
import productosData from '../data/productos.json';

export const familias = productosData.familias as Familia[];

export const categorias = [
	{ value: 'comida-preparada', label: 'Comida preparada' },
	{ value: 'bandejas-tapas', label: 'Bandejas y tapas' },
	{ value: 'bebidas', label: 'Bebidas' },
	{ value: 'huevos', label: 'Huevos' },
	{ value: 'complementos', label: 'Complementos' },
] as const;

export const materialLabel: Record<Familia['material'], string> = {
	PET: '100% PET reciclado',
	HIPS: 'Poliestireno de alto impacto (HIPS)',
	PP: 'Polipropileno',
};

export const materialCorto: Record<Familia['material'], string> = {
	PET: 'PET reciclado',
	HIPS: 'HIPS',
	PP: 'Polipropileno',
};

export function categoriaLabel(value: string): string {
	return categorias.find((c) => c.value === value)?.label ?? value;
}

export function normalize(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();
}

/** Texto en minúsculas y sin tildes que usa el buscador de /productos (nombre, descripción, color, códigos). */
export function searchBlob(f: Familia): string {
	return normalize([f.nombre, f.descripcion, f.color, ...f.items.flatMap((it) => [it.codigo, it.nombre])].join(' '));
}

export function porCategoria() {
	return categorias
		.map((c) => ({ ...c, familias: familias.filter((f) => f.categoria === c.value) }))
		.filter((g) => g.familias.length > 0);
}
