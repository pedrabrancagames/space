import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true,
    https: false,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
