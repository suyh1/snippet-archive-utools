/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Services {
  readFile(file: string): string
  writeTextFile(text: string): string
  writeImageFile(base64Url: string): string | undefined
}

interface Window {
  services: Services
}
