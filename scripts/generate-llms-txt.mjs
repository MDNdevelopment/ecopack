// Generates public/llms.txt and public/llms-full.txt from the site's data
// files, so they never drift from the actual catalog/distributor content.
// Run via `npm run build` (prebuild) or `node scripts/generate-llms-txt.mjs`.
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const empresa = JSON.parse(readFileSync(join(root, 'src/data/empresa.json'), 'utf-8'));
const productos = JSON.parse(readFileSync(join(root, 'src/data/productos.json'), 'utf-8'));
const distribuidores = JSON.parse(readFileSync(join(root, 'src/data/distribuidores.json'), 'utf-8'));
const faq = JSON.parse(readFileSync(join(root, 'src/data/faq.json'), 'utf-8'));

const SITE = 'https://ecopackvenezuela.com';
const totalSkus = productos.familias.reduce((s, f) => s + f.items.length, 0);
const totalDist = distribuidores.estados.reduce((s, e) => s + e.distribuidores.length, 0);

const materialLabel = { PET: '100% PET reciclado', HIPS: 'HIPS (poliestireno de alto impacto)', PP: 'Polipropileno' };

// --- llms.txt (concise, per the llmstxt.org convention) ---
const llms = `# Ecopack Venezuela

> ${empresa.descripcion}

Ecopack (razón social ${empresa.razonSocial}) fabrica y distribuye ${totalSkus} referencias de envases
para alimentos, la mayoría de PET 100% reciclado, avaladas por la FDA y el Reglamento (CE) Nº 282/2008.
Sede en ${empresa.ciudad}, estado ${empresa.estado}, Venezuela. Red de ${totalDist} distribuidores
autorizados en todo el país.

Contacto: ${empresa.telefono} (WhatsApp) · ${empresa.email}

## Páginas principales

- [Inicio](${SITE}/): presentación de la marca, productos destacados, cobertura y proceso de reciclaje.
- [Catálogo de productos](${SITE}/productos): ${totalSkus} SKUs organizados en ${productos.familias.length} familias (fiambreras, bandejas, Deligourmet, Ecocup, vasos, pitillos, etc.) con código, medidas, material y empaque de cada uno. Cada familia tiene su propia ficha con fotos en ${SITE}/productos/{slug}.
- [Distribuidores](${SITE}/distribuidores): mapa y listado de los ${totalDist} distribuidores autorizados, con una página propia por estado.
- [Nosotros](${SITE}/nosotros): historia de la empresa, proceso de reciclaje (tecnología EREMA) y normativas que cumple (FDA, Reglamento CE 282/2008, EFSA).
- [Preguntas frecuentes](${SITE}/preguntas-frecuentes): respuestas directas sobre seguridad alimentaria del PET reciclado, materiales, pedidos y distribución.
- [Contacto](${SITE}/#contacto): formulario y datos de contacto directo, en la página de inicio.

## Datos clave

- Materiales usados: PET 100% reciclado (la mayoría de la línea), HIPS (Fiambrera ecológica RT) y polipropileno (pitillos y removedores).
- Certificaciones/normativas: tecnología de reciclaje EREMA, Reglamento (CE) Nº 282/2008, evaluaciones EFSA, disposiciones de la FDA (EE. UU.).
- Cobertura: todo el país, ${totalDist} distribuidores autorizados.

## Notas

- El catálogo completo en PDF está en ${SITE}/catalogo-ecopack.pdf.
- Volcado exhaustivo de productos y distribuidores (para lectura por máquinas): ${SITE}/llms-full.txt.
`;

// --- llms-full.txt (exhaustive dump) ---
let full = `# Ecopack Venezuela — datos completos\n\n`;
full += `Generado a partir de las mismas fuentes de datos que usa el sitio. Fecha de generación: ${new Date().toISOString().slice(0, 10)}.\n\n`;
full += `## Empresa\n\n`;
full += `- Nombre comercial: ${empresa.nombre}\n- Razón social: ${empresa.razonSocial}\n- Ubicación: ${empresa.ciudad}, ${empresa.estado}, ${empresa.pais}\n`;
full += `- Teléfono / WhatsApp: ${empresa.telefono}\n- Correo: ${empresa.email}\n`;
full += `- Distribuidores autorizados: ${empresa.distribuidoresAutorizados}\n\n`;
full += `### Normativas y certificaciones\n\n`;
for (const n of empresa.normativas) full += `- **${n.nombre}**: ${n.descripcion}\n`;
full += `\n## Catálogo de productos (${totalSkus} SKUs en ${productos.familias.length} familias)\n\n`;
for (const fam of productos.familias) {
	full += `### ${fam.nombre}\n\n`;
	full += `- Ficha: ${SITE}/productos/${fam.slug}\n`;
	full += `- Uso: ${fam.categoria}\n- Material: ${materialLabel[fam.material] || fam.material}\n- Color: ${fam.color}\n- ${fam.descripcion}\n\n`;
	full += `| Código | Producto | Color | Medidas | Empaque | Peso del empaque |\n`;
	full += `|---|---|---|---|---|---|\n`;
	for (const it of fam.items) {
		full += `| ${it.codigo} | ${it.nombre} | ${it.color || fam.color} | ${it.medidas || '—'} | ${it.empaque} | ${it.pesoEmpaque} |\n`;
	}
	full += `\n`;
}

full += `## Distribuidores por estado (${totalDist} distribuidores)\n\n`;
const estadosOrdenados = [...distribuidores.estados].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
for (const e of estadosOrdenados) {
	full += `### ${e.nombre}\n\n`;
	for (const d of e.distribuidores) {
		full += `- ${d.porConfirmar ? 'Distribuidor autorizado (nombre por confirmar)' : d.nombre} — ${d.ciudad}\n`;
	}
	full += `\n`;
}

full += `## Preguntas frecuentes\n\n`;
for (const f of faq) full += `### ${f.pregunta}\n\n${f.respuesta}\n\n`;

writeFileSync(join(root, 'public/llms.txt'), llms, 'utf-8');
writeFileSync(join(root, 'public/llms-full.txt'), full, 'utf-8');
console.log('llms.txt and llms-full.txt generated.');
