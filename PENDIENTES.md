# Pendientes para cerrar el sitio

Todo lo demás del plan está implementado y construido. Esto es lo que solo el cliente puede
confirmar o entregar:

## 1. Fotos y video (resuelto con material de la web original)

Todos los `PlaceholderMedia` se reemplazaron con medios reales tomados de https://ecopackvenezuela.com
(biblioteca de medios de WordPress) y del catálogo PDF actualizado:

- **Hero**: ensalada en envase, portadas Deligourmet y Ecotray del catálogo, y la máquina de la planta.
- **Productos**: cada una de las 26 familias tiene foto de estudio (recortada del catálogo PDF, en
  `src/assets/productos/`) y una ficha propia en `/productos/[slug]`. Los recortes salen del PDF a
  baja resolución; si Ecopack tiene las fotos originales de estudio, basta con reemplazar el archivo
  `src/assets/productos/<slug>.webp` (el nombre es el slug de la familia).
- **Home**: 5 destacados (fotos de la web original), 11 logos de clientes, 4 publicaciones de marca y
  los dos videos.
- **Videos** (`public/videos/`): `ecopack-nosotros.mp4` (presentación, 16:9) y `ecopack-planta.mp4`
  (recorrido por la planta, vertical, con audio y subtítulos), ambos recomprimidos a ~6–8 MB.
- El PDF `public/catalogo-ecopack.pdf` es ahora el catálogo actualizado (`Catalogo-Ecopack-Act.pdf`).

Pendiente menor: las "publicaciones de Instagram" del home son piezas de marca estáticas (el feed
original de la web era un plugin dinámico y no se pudo copiar); enlazan al perfil. Si se quiere el
feed real, hay que integrarlo aparte. Además, `public/og-default.jpg` no se regeneró.

## 2. Tres distribuidores con nombre por confirmar

En `src/data/distribuidores.json`, marcados con `"porConfirmar": true`:

- **Bolívar** (Ciudad Bolívar) — el PDF original solo decía "Inversiones · nombre por confirmar".
- **Monagas** (Maturín) — sin nombre en el material fuente.
- **Portuguesa** (Guanare) — un tercer distribuidor sin nombre, además de los dos que sí tienen
  nombre (Comercial Alviz Dos, Comercial Envases Boulevard).

Mientras no se confirmen, el sitio muestra "Distribuidor autorizado" en vez de inventar un nombre.

## 3. Redes sociales

En `src/data/empresa.json` solo Instagram y TikTok tienen URL (se ven en el footer y en la sección
"Síguenos" de home). Facebook, YouTube y LinkedIn están en `null` — si existen, agrega sus URLs ahí
y aparecerán automáticamente en el footer.

## 4. Dominio definitivo

Se usó `ecopackvenezuela.com` en `astro.config.mjs` (`site`), en el JSON-LD, en `robots.txt` y en
`llms.txt`/`llms-full.txt`. Si el dominio final es otro, hay que actualizarlo en esos 2 archivos de
configuración (`astro.config.mjs` y `netlify.toml` no lo necesita) y volver a construir — todo lo
demás lee `Astro.site` o la constante `SITE_URL` de `src/lib/schema.ts`, así que el cambio es de un
solo lugar salvo `robots.txt` y `generate-llms-txt.mjs` (ambos con la URL hardcodeada por ser
archivos estáticos/de generación).

## 5. Discrepancia de medidas — Ecocup fondo curvo / fondo plano

El catálogo en PDF da dos medidas distintas para el mismo código según la página: la caja
mayorista (490×360×455 mm, 1.000 u.) y la presentación retail (≈90×50×100 mm, 50 u., que es la
medida real del vaso). El sitio usa la medida del vaso y aclara ambas presentaciones en el texto —
confirmar que esa lectura es correcta.

## 6. Catálogo del PDF, páginas 15–38

El catálogo completo (101 SKUs, 26 familias) fue transcrito visualmente del PDF porque no tiene
capa de texto. Vale la pena que alguien de Ecopack revise `src/data/productos.json` contra el PDF
original una vez, especialmente los campos de medidas más largos.

## 7. Única desviación deliberada de "tal cual": el piso de opacidad del titular de Nosotros

El efecto `data-scrub` del titular "Creemos en un futuro..." revela el texto palabra por palabra
ligado al scroll, arrancando en el mockup desde `opacity: .12`. A esa opacidad tan baja, el texto
(crema y lima sobre fondo verde oscuro) cae por debajo del contraste mínimo de accesibilidad
(WCAG AA) durante la porción inicial del scroll — verificado con Lighthouse, que marcaba ese punto
exacto como fallo real. Subí el piso a `opacity: .7`: se sigue viendo y sintiendo como una
revelación progresiva (mismo movimiento, mismo easing, mismo scroll-scrub), pero nunca cae por
debajo del contraste legible. Es el único valor numérico que toqué a propósito en todo el sistema
de animación; si prefieres el `.12` original tal cual el mockup, es un solo número en
`src/scripts/home.ts` (busca `data-scrub`).
