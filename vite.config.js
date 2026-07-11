import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vuetify from 'vite-plugin-vuetify' // Import vuetify plugin
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    tailwindcss(),
    vuetify({ autoImport: true }) // Add vuetify plugin
  ],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@tiptap')) return 'tiptap'
          if (id.includes('html2pdf') || id.includes('html2canvas') || id.includes('jspdf')) return 'pdf'
          if (id.includes('vuetify')) return 'vuetify'
          if (id.includes('@tanstack/vue-table')) return 'vue-table'
          if (id.includes('animejs')) return 'animejs'
          if (id.includes('lucide-vue-next')) return 'lucide'
          if (id.includes('splitpanes')) return 'splitpanes'
          if (id.includes('vuedraggable')) return 'vuedraggable'
          if (id.includes('vue-router')) return 'vue-router'
          if (id.includes('pinia')) return 'pinia'
          if (id.includes('vue') && !id.includes('@vue')) return 'vue'

          return 'vendor'
        },
      },
    },
  },
})
