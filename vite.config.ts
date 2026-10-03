import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages sirve el sitio bajo /la-revuelta/; en local queda en la raíz.
const base = process.env.BASE_PATH ?? '/';

/** Antepone la base a las rutas de `public/` escritas como texto en el código (el CSS y el HTML ya los resuelve Vite). */
const publicPaths = (): Plugin => ({
  name: 'public-paths',
  enforce: 'pre',
  transform(code, id) {
    if (base === '/' || !/\/src\/.*\.tsx?$/.test(id)) return;
    return code.replace(/(['"`])\/(images\/|hero\/|logo\.png)/g, `$1${base}$2`);
  },
});

export default defineConfig({
  base,
  plugins: [publicPaths(), react()],
  server: { allowedHosts: ['omarchy.tailff08b5.ts.net'] },
  preview: { allowedHosts: ['omarchy.tailff08b5.ts.net'] },
});
