import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/stmiranda.com/',
  server: {
    host: true,  // Allow requests from any host
    allowedHosts: ['fabianorozco.com'],  // Add your domain here
  },
})