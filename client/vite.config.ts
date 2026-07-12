import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, proxy API + media calls to the Express server so the app runs from
// a single origin at http://localhost:5173.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/media': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
