/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Workaround: vue-router types aren't resolved from .d.mts in this TS version
declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router.d.mts'
}
