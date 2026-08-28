import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Using relative path fixes blank screen asset loading on GitHub Pages
})
