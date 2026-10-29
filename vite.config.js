import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 4174, strictPort: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: {
    manifest: true,
    target: 'es2022',
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules\/react/ },
            { name: 'webgl', test: /node_modules\/three/ },
            { name: 'motion', test: /node_modules\/(gsap|lenis)/ },
          ],
        },
      },
    },
  },
});
