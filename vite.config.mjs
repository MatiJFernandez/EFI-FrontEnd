// Use .mjs to ensure this file is treated as an ES module by Node/Vite
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})

// Instalar dependencias de MUI
// npm install @mui/material @emotion/react @emotion/styled
// Opcional: npm install @mui/icons-material
