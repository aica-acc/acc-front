import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // /static 은 백엔드가 AI 서버에서 중계한다 (AI 서버에 직접 붙지 않음)
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8081'

  return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // AI 정적 파일 (백엔드 경유, CORS 해결)
      '/static': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  }
})
