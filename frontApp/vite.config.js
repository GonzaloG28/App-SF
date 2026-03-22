import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // OPTIMIZACIÓN: separar el bundle en chunks lógicos.
    // Sin esto todo va en un solo archivo → primera carga lenta.
    rollupOptions: {
      output: {
        manualChunks: {
          // Librerías de React — cambian poco, se cachean bien
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // TanStack Query — separado para que su caché no reinicie con updates del app
          "vendor-query": ["@tanstack/react-query"],

          // Lucide — árbol de íconos grande, conviene aislarlo
          "vendor-icons": ["lucide-react"],

          // Datepicker — pesa ~180kb solo, separarlo evita que bloquee el bundle principal
          "vendor-datepicker": ["react-datepicker"],

          // Cloudinary y utilidades de fecha — solo se usan en vistas específicas
          "vendor-utils": ["date-fns"],
        }
      }
    },

    // OPTIMIZACIÓN: avisar si algún chunk supera 500kb
    chunkSizeWarningLimit: 500,

    // OPTIMIZACIÓN: minificación agresiva con esbuild (por defecto en Vite 4+)
    minify: "esbuild",

    // OPTIMIZACIÓN: sourcemaps solo en dev — en prod aumentan el bundle innecesariamente
    sourcemap: false,
  },

  // OPTIMIZACIÓN: pre-bundling de dependencias frecuentes → menos requests en dev
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "lucide-react",
      "axios"
    ]
  }
})

