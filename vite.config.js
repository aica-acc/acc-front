import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const aiServerUrl = env.VITE_AI_SERVER_URL || 'http://127.0.0.1:5000'

  return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 백엔드 이미지 서버 프록시 (CORS 해결)
      '/static': {
        target: aiServerUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  }
})
