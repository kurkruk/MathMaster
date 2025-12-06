import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置为 './' 是为了确保资源路径是相对的
  // 这样无论你的 GitHub 仓库叫什么名字，资源都能正确加载
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})