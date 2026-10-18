import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Versión sin instalación: todo (código, estilos y fuentes) dentro de un único
// HTML que se abre con doble clic, sin servidor ni conexión a internet.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist-offline',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 4000,
    cssCodeSplit: false
  }
});
