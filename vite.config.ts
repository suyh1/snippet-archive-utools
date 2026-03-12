import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (
            id.includes('/@codemirror/lang-') ||
            id.includes('/@codemirror/legacy-modes/')
          ) {
            return 'vendor-codemirror-langs'
          }

          if (
            id.includes('/codemirror/') ||
            id.includes('/@codemirror/') ||
            id.includes('/@lezer/') ||
            id.includes('/thememirror/')
          ) {
            return 'vendor-codemirror-core'
          }

          if (
            id.includes('/reka-ui/') ||
            id.includes('/motion-v/') ||
            id.includes('/@vueuse/') ||
            id.includes('/@floating-ui/')
          ) {
            return 'vendor-ui'
          }

          if (
            id.includes('/vue/') ||
            id.includes('/pinia/')
          ) {
            return 'vendor-core'
          }
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
