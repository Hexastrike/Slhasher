import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
   port: 80,
   strictPort: true,
  },
  server: {
   port: 80,
   strictPort: true,
   host: true,
   origin: "http://0.0.0.0:80",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
 });