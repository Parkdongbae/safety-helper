import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// 배포처별 base 경로: GitHub Pages는 PAGES_BASE=/safety-helper/, Vercel은 기본값(/)
export default defineConfig({
  base: process.env.PAGES_BASE ?? "/",
  plugins: [react(), tailwindcss()],
})
