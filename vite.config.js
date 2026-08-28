import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'buhroo-interiors' with your exact GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/buhroo-interiors/', 
})