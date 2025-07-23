import { defineConfig } from 'vite';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: !isProduction,
    lib: {
      entry: 'main.ts',
      name: 'fmmua',
      formats: ['es'],
      fileName: 'main'
    },
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'main.css';
          return '[name][extname]';
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // no custom options currently
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve('src')
    }
  }
});
