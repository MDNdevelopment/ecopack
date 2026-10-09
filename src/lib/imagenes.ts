import type { ImageMetadata } from 'astro';

type Mods = Record<string, { default: ImageMetadata }>;

const productos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/productos/*.webp', { eager: true }) as Mods;
const ambiente = import.meta.glob<{ default: ImageMetadata }>('/src/assets/ambiente/*.webp', { eager: true }) as Mods;
const hero = import.meta.glob<{ default: ImageMetadata }>('/src/assets/hero/*.webp', { eager: true }) as Mods;
const clientes = import.meta.glob<{ default: ImageMetadata }>('/src/assets/clientes/*.webp', { eager: true }) as Mods;
const planta = import.meta.glob<{ default: ImageMetadata }>('/src/assets/planta/*.webp', { eager: true }) as Mods;
const instagram = import.meta.glob<{ default: ImageMetadata }>('/src/assets/instagram/*.webp', { eager: true }) as Mods;

const pick = (mods: Mods, dir: string, key: string): ImageMetadata | undefined => mods[`/src/assets/${dir}/${key}.webp`]?.default;

/** Foto de estudio de una familia (recortada del catálogo). */
export const imagenProducto = (slug: string) => pick(productos, 'productos', slug);
/** Fotos de una familia por color (`<slug>--<color>.webp`), cuando existen. */
export function variantesColor(slug: string): { key: string; img: ImageMetadata }[] {
	const prefix = `/src/assets/productos/${slug}--`;
	return Object.entries(productos)
		.filter(([path]) => path.startsWith(prefix))
		.map(([path, mod]) => ({ key: path.slice(prefix.length).replace(/\.webp$/, ''), img: mod.default }));
}
/** Foto de producto en uso (portadas del catálogo). */
export const imagenAmbiente = (key: string) => pick(ambiente, 'ambiente', key);
/** Fotos del carrusel del home (`<slide>-desktop` / `<slide>-movil`). */
export const imagenHero = (key: string) => pick(hero, 'hero', key);
export const logoCliente = (slug: string) => pick(clientes, 'clientes', slug);
export const imagenPlanta = (key: string) => pick(planta, 'planta', key);
export const imagenInstagram = (key: string) => pick(instagram, 'instagram', key);

/** Qué foto "en uso" acompaña a cada familia en su ficha. */
export function ambienteDeFamilia(slug: string): string | undefined {
	if (slug === 'ecolunch') return 'ecolunch';
	if (slug === 'ecocup-fondo-curvo') return 'ecocup-curvo';
	if (slug === 'ecocup-fondo-plano') return 'ecocup-plano';
	if (slug.startsWith('fiambrera')) return 'fiambreras';
	if (slug.startsWith('deligourmet')) return 'deligourmet';
	if (slug.startsWith('delipack')) return 'delipack';
	if (slug.startsWith('ecocup')) return 'ecocup';
	if (slug.includes('vaso')) return 'vasos-pet';
	if (slug === 'pitillos' || slug === 'removedores') return 'pitillos';
	if (slug === 'estuche-huevos') return 'huevos';
	if (slug.includes('bandeja') || slug === 'domo-discos') return 'ecotray';
	return undefined;
}
