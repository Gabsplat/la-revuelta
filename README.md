# La Revuelta

Recreación de https://www.larevueltaconsultora.com/ con React, TypeScript, Vite y anime.js. Conserva los textos, las imágenes y la identidad del original, con una nueva composición y un personaje 3D generado con GPT Images.

## Vista previa

https://omarchy.tailff08b5.ts.net:24443/

Accesible por Tailscale. La versión de producción se sirve en el puerto local 4340 con la unidad temporal `la-revuelta-preview.service`. No es un servicio permanente ni está habilitado para iniciarse con el sistema.

## Desarrollo

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Si `pnpm` no está en el PATH de la terminal de esta máquina, usar `corepack pnpm` con Corepack de Node 24.

## Páginas

- `/`
- `/que-nos-inspira`
- `/proceso-transformacion`
- `/nuestra-filosofia`
- `/clientes`
- `/clientes/ipc`
- `/clientes/nutriterra`

Las rutas de clientes se encontraron en el sitemap del original. La página de clientes del original estaba vacía después de la cabecera; esta versión vincula los dos casos existentes.

Los textos completos de las etapas y los casos están en `src/data/`. Las fuentes y las imágenes originales se descargaron para que la vista previa no dependa del sitio de referencia. Las capturas y el relevamiento están en `reference/`.

## Animación

`src/components/Story.tsx` contiene cuatro escenas vinculadas al scroll mediante una timeline de anime.js. Incluye órbitas, flotación, conexiones, aparición de comercios y expansión de la red. La secuencia puede recorrerse en ambos sentidos y con los controles inferiores. El movimiento ambiente se puede pausar. Se respeta `prefers-reduced-motion`.

El personaje, la bombita y el comercio se generaron con la herramienta integrada GPT Images, con transparencia real. Los originales PNG y las versiones WebP están en `public/images/generated/`. Los prompts completos están en `reference/image-prompts.json`.

## Contacto

`.env` contiene datos de ejemplo autorizados para esta vista previa. Copiar `.env.example` y reemplazar `VITE_CONTACT_EMAIL` y `VITE_WHATSAPP_PHONE` antes de usar contactos reales. Luego ejecutar `pnpm build`. Esta versión no envía mensajes ni consultas automáticamente.

## Verificación

Con la vista previa corriendo:

```sh
pnpm exec playwright install chromium
pnpm test
```

Para usar el Chromium instalado en esta máquina:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/home/gabsplat/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome pnpm test
```

Las pruebas recorren las siete páginas, detectan errores de navegador, verifican imágenes y desbordes, recorren las escenas hacia adelante y atrás, prueban contacto, menú móvil, casos, etapas y movimiento reducido. Las capturas de revisión están en `artifacts/`.

## Administrar la vista previa temporal

```sh
systemctl --user status la-revuelta-preview
systemctl --user stop la-revuelta-preview
tailscale serve --https=24443 off
```

Para levantarla nuevamente, con el puerto 4340 libre:

```sh
systemd-run --user --unit=la-revuelta-preview --collect --working-directory=/home/gabsplat/Labs/la-revuelta /home/gabsplat/.local/share/mise/installs/node/24.21.0/bin/corepack pnpm preview --strictPort
tailscale serve --bg --https=24443 http://127.0.0.1:4340
```
