import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do servidor e do processo de build do Vite.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Encaminha chamadas locais para o serviço FIRMS; rewrite remove o prefixo
      // /api/firms para que o caminho final corresponda ao endpoint da NASA.
      '/api/firms': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/firms/, ''),
        secure: true,
      },
    },
  },
})