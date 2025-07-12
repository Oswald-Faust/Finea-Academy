import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, './'),
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    }
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material', 'react', 'react-dom', 'react-router-dom']
  },
});
