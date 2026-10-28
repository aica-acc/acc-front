import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // 생성 이미지(/files/토큰)는 백엔드가 내보낸다 (AI 서버에 직접 붙지 않음)
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8081'

  return {
  plugins: [react(), tailwindcss()],
  // 운영 빌드에서는 디버그용 console.log/info/debug 를 뺀다 (응답 전체·경로가 브라우저 콘솔에 남지 않게). 오류(error/warn)는 둔다
  esbuild: mode === 'production' ? { pure: ['console.log', 'console.info', 'console.debug'] } : undefined,
  server: {
    proxy: {
      // 생성 이미지 (백엔드 경유, CORS 해결)
      '/files': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  }
})
