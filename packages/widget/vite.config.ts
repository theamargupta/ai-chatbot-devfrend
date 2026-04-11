import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'DevfrendChat',
      fileName: 'widget',
      formats: ['iife'],
    },
    outDir: resolve(__dirname, '../../public'),
    emptyOutDir: false,
    minify: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
      },
    },
  },
});
