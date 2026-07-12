/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// pagedjs has no bundled types — provide minimal ambient declaration
declare module 'pagedjs' {
  export class Previewer {
    on(event: string, handler: (flow: any) => void): void
    preview(source: HTMLElement, stylesheets: string[], destination: HTMLElement): Promise<any>
  }
}

// Workaround: vue-router types aren't resolved from .d.mts in this TS version
declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router.d.mts'
}
