import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 프론트(5173)에서 /app 으로 보내는 요청을 WebLogic 백엔드(7001)로 전달한다.
// 그래서 CORS 설정 없이 Authorization 헤더가 그대로 백엔드까지 간다.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/app': 'http://localhost:7001',
    },
  },
})
