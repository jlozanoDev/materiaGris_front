import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

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
      return store
    },
  }
})

// ============================================================================
// Mock vue-router
// ============================================================================

const mockRoute = { name: 'AdminReportTemplateCreate', params: {} }
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => mockRoute,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      currentRoute: { value: mockRoute },
    }),
  }
})

// ============================================================================
// Mock system variable registry
// ============================================================================

const mockSystemVariables = {
  ensureLoaded: vi.fn().mockResolvedValue(undefined),
  getAll: vi.fn().mockReturnValue([]),
  search: vi.fn().mockReturnValue([]),
}

vi.mock('@/shared/composables/useSystemVariableRegistry', () => ({
  useSystemVariableRegistry: () => mockSystemVariables,
  SYSTEM_VARIABLES_KEY: Symbol('systemVariables'),
}))

// ============================================================================
// Mock use cases
// ============================================================================

const mockCreateUseCase = { execute: vi.fn() }
const mockUpdateUseCase = { execute: vi.fn() }
const mockGetUseCase = { execute: vi.fn() }

vi.mock('@/modules/admin/report-template/application/containers/reportTemplateContainer', () => ({
  provideGetReportTemplateUseCase: () => mockGetUseCase,
  provideCreateReportTemplateUseCase: () => mockCreateUseCase,
  provideUpdateReportTemplateUseCase: () => mockUpdateUseCase,
}))

vi.mock('@/core/store/clinic', () => ({
  useClinicStore: () => ({
    clinic: null,
    loading: false,
    error: null,
    fetchClinic: vi.fn().mockResolvedValue(null),
    updateLogo: vi.fn(),
  }),
}))

// ============================================================================
// Mock useTemplateBuilder composable
// ============================================================================

import { reactive } from 'vue'

function makeMockStore(overrides: Record<string, any> = {}) {
  return reactive({
    sections: [],
    selectedFieldId: null,
    undoStack: [],
    redoStack: [],
    isDirty: false,
    templateId: 0,
    templateName: '',
    templateDescription: '',
    activeZone: 'header',
    headerSections: [],
    footerSections: [],
    headerEnabled: false,
    footerEnabled: false,
    headerPageDisplay: 'all',
    footerPageDisplay: 'all',
    activeSections: [],
    switchZone: vi.fn(),
    loadTemplate: vi.fn(),
    addSection: vi.fn(),
    removeSection: vi.fn(),
    addRow: vi.fn(),
    removeRow: vi.fn(),
    addColumn: vi.fn(),
    addField: vi.fn(),
    removeField: vi.fn(),
    updateField: vi.fn(),
    reorderSections: vi.fn(),
    moveField: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    saveTemplate: vi.fn().mockResolvedValue({}),
    ...overrides,
  })
}

let mockStore = makeMockStore()

vi.mock('@/modules/admin/report-template/presentation/composables/useTemplateBuilder', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../composables/useTemplateBuilder')>()
  return {
    ...actual,
    useTemplateBuilder: () => mockStore,
  }
})

// ============================================================================
// Helpers
// ============================================================================

async function createWrapper(): Promise<any> {
  const { mount, flushPromises } = await import('@vue/test-utils')
  const ReportTemplateBuilderPage = (await import('../ReportTemplateBuilderPage.vue')).default

  const wrapper = mount(ReportTemplateBuilderPage, {
    global: {
      stubs: {
        AppSidebar: true,
        TopBarLayout: true,
        Breadcrumb: true,
        SectionPanel: true,
        FieldPropertiesPanel: true,
        FieldPalette: true,
        HeaderFooterEditor: true,
        draggable: true,
        Splitpanes: {
          template: '<div><slot /></div>',
        },
        Pane: {
          template: '<div><slot /></div>',
          props: ['size', 'minSize'],
        },
        PreviewModal: {
          props: ['show', 'sections', 'headerSections', 'footerSections', 'templateName', 'variableResolver'],
          template: '<div data-testid="preview-modal" />',
          name: 'PreviewModalStub',
        },
        PrintPreviewModal: {
          props: ['show', 'sections', 'headerSections', 'footerSections', 'templateName', 'variableResolver'],
          template: '<div data-testid="print-preview-modal" />',
          name: 'PrintPreviewModalStub',
        },
        Modal: {
          props: ['show'],
          template: '<div v-if="show"><slot /><slot name="footer"/></div>',
        },
      },
    },
  })

  await flushPromises()
  return wrapper
}

function resetStore(overrides: Record<string, any> = {}) {
  mockStore = makeMockStore(overrides)
}

// ============================================================================
// Tests
// ============================================================================

describe('ReportTemplateBuilderPage — variableResolver wiring', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetStore()
    vi.clearAllMocks()
  })

  it('renders PreviewModal with variableResolver prop', async () => {
    const wrapper = await createWrapper()
    const previewModal = wrapper.find('[data-testid="preview-modal"]')
    expect(previewModal.exists()).toBe(true)
  }, 15000)

  it('renders PrintPreviewModal with variableResolver prop', async () => {
    const wrapper = await createWrapper()
    const printModal = wrapper.find('[data-testid="print-preview-modal"]')
    expect(printModal.exists()).toBe(true)
  })

  it('passes variableResolver as a function to PreviewModal', async () => {
    const wrapper = await createWrapper()
    const previewModal = wrapper.findComponent({ name: 'PreviewModalStub' })
    expect(previewModal.exists()).toBe(true)
    expect(typeof previewModal.props('variableResolver')).toBe('function')
  })

  it('passes variableResolver as a function to PrintPreviewModal', async () => {
    const wrapper = await createWrapper()
    const printModal = wrapper.findComponent({ name: 'PrintPreviewModalStub' })
    expect(printModal.exists()).toBe(true)
    expect(typeof printModal.props('variableResolver')).toBe('function')
  })

  it('variableResolver does not throw when resolving clinic variables', async () => {
    const wrapper = await createWrapper()
    const previewModal = wrapper.findComponent({ name: 'PreviewModalStub' })
    const resolver = previewModal.props('variableResolver') as (text: string) => string
    expect(() => resolver('{clinica.nombre}')).not.toThrow()
    expect(() => resolver('{clinica.logo}')).not.toThrow()
  })
})
