import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, afterEach } from 'vitest'
import vHasPermission from '../src/shared/directives/v-has-permission'
import { routerKey } from 'vue-router'
import { setAuthService, setStorageGateway } from '../src/core/services/serviceRegistry'

// Mock storage gateway and auth service for all tests
const mockStorage = {
  get: () => null,
  set: () => {},
  remove: () => {},
  clear: () => {},
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
}

const mockAuthService = {
  userRepository: { me: () => Promise.resolve(null), login: () => {}, logout: () => {}, refresh: () => {}, forgot: () => {}, reset: () => {} },
  storageGateway: mockStorage,
  login: () => Promise.resolve({}),
  validateToken: () => Promise.resolve(false),
  logout: () => Promise.resolve(),
  clearSession: () => {},
}

setStorageGateway(mockStorage)
setAuthService(mockAuthService)

// Initialize a fresh Pinia per test to avoid state leaking between tests
beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  // register the pinia instance as a global plugin for mounting components
  config.global.plugins = [pinia]
})

afterEach(() => {
  // remove active pinia and clear global plugins between tests
  try { setActivePinia(null) } catch (e) {}
  config.global.plugins = []
})

// Global stub for router-link/RouterLink to avoid component resolution warnings
config.global.components = {
  'router-link': { template: '<a><slot /></a>' },
  RouterLink: { template: '<a><slot /></a>' },
}

// Provide a minimal router injection to silence "injection 'Symbol(router)' not found" warnings
config.global.provide = {
  [routerKey]: {
    push: () => {},
    replace: () => {},
    currentRoute: { value: {} },
  },
}

// Global plugins and directives
// note: `config.global.plugins` is set per-test in the hooks above
config.global.directives = {
  'has-permission': vHasPermission
}

// Mock window.scrollTo for jsdom (used by vue-router)
window.scrollTo = () => {}

// Mock HTMLCanvasElement.getContext for jsdom (used by useParticleNetwork)
HTMLCanvasElement.prototype.getContext = () => null

// Mock ResizeObserver for jsdom (used by useParticleNetwork)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock

// Mock window.matchMedia for jsdom (used by useParticleNetwork and others)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Silence Vue warnings about missing transitions in tests (optional)
config.global.stubs = {
  transition: false,
  'transition-group': false,
}
