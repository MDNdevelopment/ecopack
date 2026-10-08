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

export interface ColorChip {
	key: string;
	label: string;
	/** Valor CSS de `background` del punto de muestra. */
	css: string;
}

const CHIPS: ColorChip[] = [
	{ key: 'negro', label: 'Negro', css: '#1b1d1c' },
	{ key: 'blanco', label: 'Blanco', css: '#ffffff' },
	{ key: 'transparente', label: 'Transparente', css: 'linear-gradient(135deg, #f4f8f9 0%, #cfdde2 100%)' },
	{ key: 'rojo', label: 'Rojo', css: '#d9362b' },
	{ key: 'dorado', label: 'Dorado', css: 'linear-gradient(135deg, #e8c766 0%, #b8892a 100%)' },
	{ key: 'mixto', label: 'Mixto', css: 'linear-gradient(180deg, #e3edf0 50%, #1b1d1c 50%)' },
];

/** Colores de una familia, en el orden en que aparecen en su texto de color ("Negro, blanco y transparente"). */
export function coloresDe(color: string): ColorChip[] {
	const t = normalize(color);
	return CHIPS.map((c) => ({ c, i: t.indexOf(c.key) }))
		.filter((x) => x.i >= 0)
		.sort((a, b) => a.i - b.i)
		.map((x) => x.c);
}

export const chipDe = (key: string): ColorChip | undefined => CHIPS.find((c) => c.key === key);
