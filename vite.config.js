import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,  // Allow requests from any host
    port: 5173,  // Explicit port
    strictPort: true,  // Don't try other ports if 5173 is taken
    allowedHosts: ['fabianorozco.com'],  // Add your domain here
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})