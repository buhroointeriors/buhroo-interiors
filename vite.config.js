import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match your repository name exactly with slashes on both sides
export default defineConfig({
  plugins: [react()],
  base: '/buhroo-interiors/',
})
