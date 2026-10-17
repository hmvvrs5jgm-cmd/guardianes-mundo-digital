import { defineConfig } from 'vite';

// En GitHub Pages el juego se sirve desde /<nombre-del-repositorio>/.
// BASE_PATH permite cambiarlo sin tocar el código (ver README).
// `npm run preview` usa la misma base que la compilación para reproducir GitHub Pages.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? process.env.BASE_PATH || '/guardianes-mundo-digital/' : '/',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] }
      }
    }
  }
}));
