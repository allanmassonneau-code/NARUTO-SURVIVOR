import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le build se sert depuis n'importe quel sous-dossier (artifact, GitHub Pages…).
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
    rolldownOptions: {
      output: {
        // Phaser (≈1,2 Mo) dans son propre fichier : il change rarement et reste en cache.
        advancedChunks: { groups: [{ name: 'phaser', test: /node_modules[\\/]phaser/ }] },
      },
    },
  },
  server: { host: true },
});
