# Feed de Instagram en el home — qué hay que hacer

Objetivo: que la sección "Síguenos en @ecopackvzla" muestre los últimos posts y reels reales de
`@ecopackvzla` en lugar de las 4 piezas de marca estáticas que hay hoy
(`posts` en `src/pages/index.astro`).

**Enfoque elegido:** pedir el feed a Instagram **al construir el sitio** (build), no desde el
navegador, y reconstruir el sitio una vez al día con un build hook de Netlify.

- El token nunca llega al navegador.
- La página sigue siendo estática y rápida.
- Si Instagram falla, el sitio sigue mostrando las 4 piezas actuales.

> Meta no usa una "API key". Lo que se necesita es un **token de acceso** de la cuenta.

---

## Parte 1 — Lo que haces tú (Meta / Instagram)

### 1. Pasar la cuenta a profesional
`@ecopackvzla` debe ser **Business** o **Creator**.
Instagram → Configuración → Cuenta → *Cambiar a cuenta profesional*.
(Si ya lo es, sáltate este paso.)

### 2. Crear la app en Meta for Developers
1. Entra a <https://developers.facebook.com/apps> → **Crear app**.
2. Tipo / caso de uso: **Business** (o "Otro" → Business) y que incluya el producto **Instagram**.
3. En el panel de la app: **Agregar producto → Instagram → "API setup with Instagram login"**
   (*Instagram API con inicio de sesión de Instagram*).

### 3. Dar acceso a la cuenta (modo desarrollo, sin revisión de Meta)
Como solo leemos **tu propia cuenta**, la app puede quedarse en modo desarrollo; no hace falta
pasar la revisión de Meta.

1. En la app: **Roles de la app → Roles → Agregar personas → Instagram Tester**, y pon `@ecopackvzla`.
2. En la app de Instagram, con esa cuenta: **Configuración → Apps y sitios web → Invitaciones de
   tester** → aceptar.

### 4. Generar el token
1. En **Instagram → API setup with Instagram login → "Generate access tokens"**, añade la cuenta
   y pulsa **Generate token**.
2. Autoriza el permiso **`instagram_business_basic`** (es el único que hace falta para leer
   posts y reels).
3. Copia el token. Es de **larga duración: dura 60 días** y se puede renovar (ver Parte 3).

### 5. Guardar el token (no en el código, no en el chat)
- **Local:** crea `.env` en la raíz del proyecto:
  ```
  IG_ACCESS_TOKEN=pega_aqui_el_token
  ```
  y asegúrate de que `.env` esté en `.gitignore` (el proyecto hoy no es un repo git: si lo
  inicializas, añade esa línea antes del primer commit).
- **Producción:** Netlify → *Site configuration → Environment variables* → añade
  `IG_ACCESS_TOKEN` con el mismo valor.

> Nunca uses el prefijo `PUBLIC_` en esa variable: expondría el token en el navegador.

### 6. Crear el build hook de Netlify
Netlify → *Site configuration → Build & deploy → Build hooks → Add build hook*
(ej. nombre `instagram-diario`, rama principal). Guarda la URL que te da.

### 7. Programar la reconstrucción diaria
Elige una:
- **Netlify Scheduled Function** (cron `0 12 * * *`) que haga un `POST` a la URL del build hook, o
- Un servicio de cron gratuito (ej. cron-job.org) que haga `POST` a esa URL una vez al día.

Cada reconstrucción trae los posts nuevos y, de paso, renueva el token (ver Parte 3).

---

## Parte 2 — Lo que hago yo en el código (cuando tengas el token)

1. **`src/lib/instagram.ts`** — función que, al construir el sitio:
   ```
   GET https://graph.instagram.com/me/media
       ?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp
       &limit=8
       &access_token=$IG_ACCESS_TOKEN
   ```
   y devuelve una lista normalizada.
   - **Posts de imagen:** se usa `media_url`.
   - **Carruseles:** `media_url` ya trae la primera imagen.
   - **Reels / videos:** se usa `thumbnail_url` (la miniatura) con un ícono de play; al hacer clic
     abre el reel en Instagram (`permalink`). No se descarga ni se incrusta el video.
2. **`astro.config.mjs`** — añadir `image.remotePatterns` para los dominios de imágenes de
   Instagram (`*.cdninstagram.com`, `*.fbcdn.net`). Astro descarga y optimiza esas imágenes **en el
   build** y las sirve desde el propio dominio, así que no importa que las URLs de Instagram caduquen.
3. **`src/pages/index.astro`** — la sección Instagram lee de `instagram.ts`. Cada celda enlaza
   al `permalink`, con `alt` tomado del `caption` (recortado) y el ícono de play en los reels.
4. **Respaldo:** si falta `IG_ACCESS_TOKEN`, la petición falla o devuelve vacío, se usan las 4
   piezas estáticas actuales y el build **no se rompe**.
5. **Renovación del token** (opcional, recomendada): al final de cada build, llamar a
   `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=…`
   Esto extiende el token otros 60 días. Como el build corre a diario, nunca llega a caducar.
   Para que el nuevo token se guarde hay que actualizar la variable de entorno de Netlify vía su
   API (`NETLIFY_API_TOKEN` + `NETLIFY_SITE_ID`). Si no quieres eso, ver "Plan B" abajo.
6. Actualizar `PENDIENTES.md` (quitar la nota del feed estático) y documentar las variables en el `README.md`.

---

## Parte 3 — Caducidad del token

| Situación | Qué pasa |
|---|---|
| Token nuevo | Vale 60 días. |
| Se renueva antes de caducar | Vale otros 60 días desde la renovación. Debe tener al menos 24 h de antigüedad. |
| Caduca sin renovarse | El feed deja de actualizarse; el sitio muestra las piezas de respaldo y hay que generar un token nuevo (Parte 1, paso 4). |

**Plan B (sin automatizar la renovación):** poner un recordatorio cada ~50 días para renovar el
token a mano con la llamada de refresh y actualizar la variable en Netlify.

---

## Qué necesito de ti para empezar

- [ ] Confirmar que `@ecopackvzla` es cuenta Business/Creator.
- [ ] Confirmar que el sitio se publica en Netlify.
- [ ] Tener el token en `.env` como `IG_ACCESS_TOKEN` (no pegarlo en el chat).
- [ ] Cuántos posts mostrar (propuesta: **8**, en 4 columnas desktop / 2 móvil).
- [ ] Decidir la renovación del token: automática (con API de Netlify) o manual (Plan B).

## Problemas comunes

- **`Invalid OAuth access token`:** el token caducó o se copió incompleto → generar uno nuevo.
- **`(#10) Application does not have permission`:** falta aceptar la invitación de Instagram Tester
  o el permiso `instagram_business_basic`.
- **El feed sale vacío:** la cuenta no es profesional, o no tiene publicaciones visibles.
- **Imágenes rotas en el sitio:** faltan los `remotePatterns` en `astro.config.mjs`.
