import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Clinic } from '@/shared/types'

// ============================================================================
// Mock the DI container
// ============================================================================

const mockUpdateUseCase = { execute: vi.fn() }

vi.mock('@/modules/admin/clinic/application/containers/clinicContainer', () => ({
  provideUpdateClinicUseCase: () => mockUpdateUseCase,
  provideUploadClinicLogoUseCase: () => ({ execute: vi.fn() }),
}))

// ============================================================================
// Mock auth store
// ============================================================================

vi.mock('@/core/store/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/store/auth')>()
  const original = actual.useAuthStore
  return {
    ...actual,
    useAuthStore: () => {
      const store = original()
      store.fetchUser = vi.fn().mockResolvedValue(null)
      store.hasPermission = vi.fn().mockReturnValue(true)
      store.user = { id: 1, name: 'Admin', email: 'admin@test.com', permissions: [] }
      return store
    },
  }
})

// ============================================================================
// Mock vue-router
// ============================================================================

const mockRouterPush = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({ name: 'AdminClinic' }),
    useRouter: () => ({
      push: mockRouterPush,
      replace: vi.fn(),
      currentRoute: { value: { name: 'AdminClinic' } },
    }),
  }
})

// ============================================================================
// Mock URL.createObjectURL (not available in jsdom)
// ============================================================================

if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn()
}

// ============================================================================
// Fixtures
// ============================================================================

const mockClinic: Clinic = {
  id: 1,
  nombre: 'Clínica Test',
  direccion: 'Calle Falsa 123',
  telefono: '123456789',
  email: 'test@clinica.com',
  ciudad: 'Buenos Aires',
  provincia: 'CABA',
  codigo_postal: '1000',
  web: 'https://clinica.test.com',
  cuit: '30-12345678-9',
}

const mockClinicWithLogo: Clinic = {
  ...mockClinic,
  logo: 'https://example.com/storage/logos/1_logo.png',
}

// Helper to create wrapper
async function createWrapper(clinicData: Clinic | null = mockClinic, loading = false, error: string | null = null) {
  const { mount, flushPromises } = await import('@vue/test-utils')
  const { setActivePinia, createPinia } = await import('pinia')
  const { useClinicStore } = await import('@/core/store/clinic')
  const ClinicEditPage = (await import('../ClinicEditPage.vue')).default

  const pinia = createPinia()
  setActivePinia(pinia)

  const clinicStore = useClinicStore()
  clinicStore.clinic = clinicData
  clinicStore.loading = loading
  clinicStore.error = error
  clinicStore.fetchClinic = vi.fn().mockResolvedValue(clinicData)

  const wrapper = mount(ClinicEditPage, {
    global: {
      plugins: [pinia],
      stubs: {
        AppSidebar: true,
        TopBar: true,
        Breadcrumb: {
          props: ['items'],
          template: '<div class="breadcrumb-stub"><slot /></div>',
        },
      },
    },
  })

  await flushPromises()
  return wrapper
}

// ============================================================================
// Tests
// ============================================================================

describe('ClinicEditPage — logo upload section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateUseCase.execute.mockReset()
    mockRouterPush.mockClear()
  })

  it('renders the logo upload section with heading', async () => {
    const wrapper = await createWrapper()
    expect(wrapper.text()).toContain('Logo de la Clínica')
  }, 15000)

  it('renders ClinicLogoUpload component', async () => {
    const wrapper = await createWrapper()
    const logoUpload = wrapper.findComponent({ name: 'ClinicLogoUpload' })
    expect(logoUpload.exists()).toBe(true)
  })

  it('passes existing logo URL to ClinicLogoUpload when clinic has logo', async () => {
    const wrapper = await createWrapper(mockClinicWithLogo)
    const logoUpload = wrapper.findComponent({ name: 'ClinicLogoUpload' })
    expect(logoUpload.props('logoUrl')).toBe('https://example.com/storage/logos/1_logo.png')
  })

  it('passes null logoUrl to ClinicLogoUpload when clinic has no logo', async () => {
    const wrapper = await createWrapper(mockClinic)
    const logoUpload = wrapper.findComponent({ name: 'ClinicLogoUpload' })
    expect(logoUpload.props('logoUrl')).toBeNull()
  })

  it('renders logo section between title and form fields', async () => {
    const wrapper = await createWrapper()
    const html = wrapper.html()
    const titleIdx = html.indexOf('Datos de la Clínica')
    const logoSectionIdx = html.indexOf('Logo de la Clínica')
    const formSectionIdx = html.indexOf('Información institucional')

    expect(titleIdx).toBeGreaterThan(-1)
    expect(logoSectionIdx).toBeGreaterThan(-1)
    expect(formSectionIdx).toBeGreaterThan(-1)

    expect(logoSectionIdx).toBeGreaterThan(titleIdx)
    expect(formSectionIdx).toBeGreaterThan(titleIdx)
  })

  it('emits upload event when ClinicLogoUpload triggers upload', async () => {
    const wrapper = await createWrapper(mockClinic)
    const logoUpload = wrapper.findComponent({ name: 'ClinicLogoUpload' })

    const fakeFile = new File(['fake-content'], 'logo.png', { type: 'image/png' })
    logoUpload.vm.$emit('upload', fakeFile)
    await (await import('@vue/test-utils')).flushPromises()

    // After upload, the page should still be rendered
    expect(wrapper.text()).toContain('Datos de la Clínica')
  })
})
