# Ecopack Venezuela — sitio web

Sitio estático en [Astro](https://astro.build), construido a partir del rediseño de MDN Publicidad
(`Home v2` / `Distribuidores v2`). Cero framework de UI, JS mínimo, pensado para Lighthouse 100 y
para que los buscadores y las IAs (ChatGPT, Perplexity, Gemini, Claude) puedan citar el catálogo.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run build       # genera dist/ (incluye prebuild: llms.txt / llms-full.txt)
npm run preview     # sirve dist/ en local para probar el build de producción
npx astro check     # chequeo de tipos
```

## Estructura

- `src/data/*.json` — toda la información editable del sitio: catálogo (`productos.json`, 101 SKUs
  en 26 familias, transcrito del PDF del cliente), `distribuidores.json` (32 distribuidores / 16
  estados), `empresa.json`, `clientes.json`, `faq.json`. Editar estos archivos actualiza el sitio
  entero sin tocar componentes.
- `src/components/` — piezas reutilizables (Header, Footer, HeroCarousel, MapaVenezuela, TablaSkus,
  FiltrosProductos, FormWhatsApp…).
- `src/pages/` — una ruta por archivo; `distribuidores/[estado].astro` genera las 16 páginas por
  estado en build time.
- `src/scripts/*.ts` — JS de progressive enhancement (menú, carrusel, filtros, animaciones). Sin
  frameworks; cada script se compila e inyecta inline, ~4–5 KB minificados por página.
- `scripts/generate-llms-txt.mjs` — genera `public/llms.txt` y `public/llms-full.txt` a partir de
  los mismos JSON de datos, en cada build (`npm run prebuild`).

## Lighthouse

Performance / Accessibility / Best Practices / SEO: **100/100/100/100** en todas las páginas
probadas (desktop y mobile), incluida `/productos` con las 101 filas de la tabla.

```bash
npm run build && npm run preview &
npx lighthouse http://localhost:4321/ --preset=desktop --view
npx lighthouse http://localhost:4321/productos --view   # sin --preset = mobile
```

## Deploy (Netlify)

`netlify.toml` ya define build command (`npm run build`), publish dir (`dist`), cache headers para
`/_astro/*` y `/fonts/*`, y headers de seguridad. Basta con conectar el repo en Netlify.

## Pendientes del lado del cliente

Ver [`PENDIENTES.md`](./PENDIENTES.md): fotos de producto, 3 distribuidores con nombre por
confirmar, redes sociales sin URL y el dominio definitivo para `astro.config.mjs` / JSON-LD /
sitemap / `llms.txt` (por ahora `ecopackvenezuela.com`).
