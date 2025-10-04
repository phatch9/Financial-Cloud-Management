import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests starting with '/api' to your Spring Boot server
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        // if ever use cookies/sessions, secure: false,
      },
    }
  }
})
