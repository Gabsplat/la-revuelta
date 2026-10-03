# La Revuelta

Rediseño de https://www.larevueltaconsultora.com/ con React, TypeScript, Vite y anime.js. Conserva los textos, las imágenes y los colores del original (negro y amarillo `#fcf532`), con una dirección visual propia: tipografía de afiche, secciones que alternan negro, papel y amarillo, cintas, sellos giratorios y tarjetas apiladas.

## Publicado

https://gabsplat.github.io/la-revuelta/

Cada push a `main` lo compila y despliega en GitHub Pages con `.github/workflows/pages.yml`. El build usa `BASE_PATH=/la-revuelta/` y copia `index.html` a `404.html` para que las subpáginas abran directo.

## Vista previa local

https://omarchy.tailff08b5.ts.net:24443/

Accesible por Tailscale. Se sirve `dist/` en el puerto local 4340 con la unidad temporal `la-revuelta-preview.service`; alcanza con `pnpm build` para actualizarla. No es un servicio permanente ni arranca con el sistema.

```sh
systemctl --user status la-revuelta-preview
systemctl --user stop la-revuelta-preview
tailscale serve --https=24443 off
```

Para levantarla de nuevo, con el puerto 4340 libre:

```sh
systemd-run --user --unit=la-revuelta-preview --collect --working-directory=/home/gabsplat/Labs/la-revuelta /home/gabsplat/.local/share/mise/installs/node/24.21.0/bin/corepack pnpm preview --strictPort
tailscale serve --bg --https=24443 http://127.0.0.1:4340
```

## Desarrollo

```sh
pnpm install
pnpm dev
pnpm build
```

Si `pnpm` no está en el PATH, usar `corepack pnpm` con el Corepack de Node 24.

## Estructura

- `src/content.ts`: navegación, etapas, casos, inspiraciones y capítulos de la historia. Los textos largos están en `src/data/`.
- `src/lib/motion.ts`: animaciones compartidas, declaradas en el markup con `data-lines`, `data-reveal`, `data-count`, `data-parallax`, `data-spin` y `data-fill`.
- `src/components/Story.tsx`: la historia del personaje.
- `src/components/Home.tsx`, `Pages.tsx`, `Chrome.tsx`: inicio, subpáginas y elementos comunes.

Páginas: `/`, `/que-nos-inspira`, `/proceso-transformacion`, `/nuestra-filosofia`, `/clientes`, `/clientes/ipc`, `/clientes/nutriterra`.

## La historia del personaje

Una timeline de anime.js sincronizada con el scroll mueve el estado de la escena, y un timer la dibuja en un canvas a pantalla completa. Son cinco capítulos: las necesidades salen de la cabeza del personaje y lo orbitan, aparecen las empresas apagadas, cada necesidad viaja hasta una empresa y la enciende, el valor vuelve al personaje, la red crece en oleadas y se cierra con un infinito. Se puede recorrer en ambos sentidos y saltar de capítulo desde la barra inferior. Con `prefers-reduced-motion` no hay movimiento ambiente.

El personaje, la bombita y el comercio están en `public/images/generated/`; sus prompts, en `reference/image-prompts.json`.

## Contacto

`.env` tiene datos de ejemplo. Copiar `.env.example`, reemplazar `VITE_CONTACT_EMAIL` y `VITE_WHATSAPP_PHONE`, y volver a compilar.

## Revisión visual

Con la vista previa corriendo:

```sh
node tests/shots.cjs          # todas las páginas, escritorio y móvil
node tests/shots.cjs home     # una sola
```

Guarda capturas en `artifacts/` y falla si hay errores de consola, imágenes rotas o desborde horizontal. Usa el Playwright de `Labs/briggs-rauscher`; se puede cambiar con `PLAYWRIGHT_PATH`.
