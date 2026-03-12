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
            id.includes('/thememirror/') ||
            id.includes('/@codemirror/theme-one-dark/')
          ) {
            return 'vendor-codemirror-themes'
          }

          if (
            id.includes('/@codemirror/search/') ||
            id.includes('/@codemirror/autocomplete/') ||
            id.includes('/@codemirror/commands/') ||
            id.includes('/@replit/codemirror-minimap/')
          ) {
            return 'vendor-codemirror-tools'
          }

          if (
            id.includes('/codemirror/') ||
            id.includes('/@codemirror/state/') ||
            id.includes('/@codemirror/view/') ||
            id.includes('/@codemirror/language/') ||
            id.includes('/crelt/') ||
            id.includes('/style-mod/') ||
            id.includes('/w3c-keyname/') ||
            id.includes('/@marijn/find-cluster-break/') ||
            id.includes('/@lezer/common/') ||
            id.includes('/@lezer/highlight/') ||
            id.includes('/@lezer/lr/')
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
