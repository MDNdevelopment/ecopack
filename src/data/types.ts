export interface Item {
	codigo: string;
	nombre: string;
	medidas?: string;
	empaque: string;
	pesoEmpaque: string;
	color?: string;
	capacidadCc?: number;
	retail?: boolean;
}

export interface Familia {
	slug: string;
	nombre: string;
	categoria: string;
	material: 'PET' | 'HIPS' | 'PP' | 'CARTON';
	color: string;
	descripcion: string;
	/** Diseños con foto propia (`<slug>--<key>.webp`), cuando la familia varía por diseño y no por color. */
	disenos?: { key: string; label: string }[];
	items: Item[];
}
