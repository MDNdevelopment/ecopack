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
	material: 'PET' | 'HIPS' | 'PP';
	color: string;
	descripcion: string;
	items: Item[];
}
