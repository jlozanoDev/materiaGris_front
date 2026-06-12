import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppSidebar from '@/shared/components/AppSidebar.vue'

// ---------- Mock useAuthStore ----------
const mockUser = vi.hoisted(() => {
  let _user: any = null
  return {
    get value() { return _user },
    set value(v) { _user = v },
  }
})

vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    get user() { return mockUser.value },
    hasPermission: (slug: string) => {
      if (!mockUser.value) return false
      return (mockUser.value.permissions as string[]).includes(slug)
    },
    hasPermissions: (slugs: string[], mode: 'any' | 'all') => {
      if (!mockUser.value) return false
      return mode === 'all'
        ? slugs.every((s: string) => (mockUser.value.permissions as string[]).includes(s))
        : slugs.some((s: string) => (mockUser.value.permissions as string[]).includes(s))
    },
    fetchUser: vi.fn(),
    clearUser: vi.fn(),
  }),
}))

// ---------- Mock useLogout ----------
vi.mock('@/shared/composables/useLogout', () => ({
  useLogout: () => ({
    logout: vi.fn(),
    loading: { value: false },
  }),
}))

// ---------- Mock useToast ----------
vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ show: vi.fn() }),
}))

// ---------- Helpers ----------
function setUser(permissions: string[]) {
  mockUser.value = { id: 1, name: 'Test', email: 'test@test.com', permissions }
}

function mountSidebar() {
  const pinia = createPinia()
  setActivePinia(pinia)

  // Real router so useRoute() works
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'Dashboard' },
      { path: '/informes', name: 'ReportList' },
    ],
  })

  return mount(AppSidebar, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'router-link': { template: '<a><slot /></a>' },
        transition: false,
        'transition-group': false,
      },
    },
  })
}

async function mountSidebarWithSettingsOpen() {
  const wrapper = mountSidebar()

  // Find and click the settings button to open the dropdown
  // Settings button is the one with aria-label="Ajustes"
  const settingsBtn = wrapper.find('button[aria-label="Ajustes"]')
  if (settingsBtn.exists()) {
    await settingsBtn.trigger('click')
  }

  return wrapper
}

describe('AppSidebar — Reports Navigation Link', () => {
  it('renders "Informes" link when user has report.view permission', async () => {
    setUser(['report.view'])
    const wrapper = await mountSidebarWithSettingsOpen()

    const links = wrapper.findAll('li > button')
    const informesBtn = links.find(btn => btn.text().includes('Informes'))
    expect(informesBtn).toBeTruthy()
    expect(informesBtn!.text()).toBe('Informes')
  })

  it('does NOT render "Informes" link when user lacks report.view', async () => {
    setUser(['report.edit', 'report.create'])
    const wrapper = await mountSidebarWithSettingsOpen()

    const links = wrapper.findAll('li > button')
    const informesBtn = links.find(btn => btn.text().includes('Informes'))
    expect(informesBtn).toBeFalsy()
  })

  it('does NOT render "Informes" link when user has no permissions', async () => {
    setUser([])
    const wrapper = await mountSidebarWithSettingsOpen()

    const links = wrapper.findAll('li > button')
    const informesBtn = links.find(btn => btn.text().includes('Informes'))
    expect(informesBtn).toBeFalsy()
  })

  it('does NOT render "Informes" link when user is null (not logged in)', async () => {
    mockUser.value = null
    const wrapper = await mountSidebarWithSettingsOpen()

    const links = wrapper.findAll('li > button')
    const informesBtn = links.find(btn => btn.text().includes('Informes'))
    expect(informesBtn).toBeFalsy()
  })

  it('"Informes" link uses pi-file-check icon', async () => {
    setUser(['report.view'])
    const wrapper = await mountSidebarWithSettingsOpen()

    const links = wrapper.findAll('li > button')
    const informesBtn = links.find(btn => btn.text().includes('Informes'))
    expect(informesBtn).toBeTruthy()

    const icon = informesBtn!.find('i')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('pi-file-check')
  })

  it('separator line renders before "Informes" when user has report.view', async () => {
    setUser(['report.view'])
    const wrapper = await mountSidebarWithSettingsOpen()

    // The separator <li aria-hidden="true"> before "Informes" should exist
    const separators = wrapper.findAll('li[aria-hidden="true"]')
    // At least 1 separator (the one before Informes — other admin separators may not render without admin perms)
    expect(separators.length).toBeGreaterThanOrEqual(1)
  })
})
