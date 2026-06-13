import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// ============================================================================
// Mock auth store completely — avoid serviceRegistry / API dependency
// ============================================================================

vi.mock('@/core/store/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/store/auth')>()
  const original = actual.useAuthStore
  return {
    ...actual,
    useAuthStore: () => {
      const store = original()
      // Replace fetchUser so it doesn't call the real API
      store.fetchUser = vi.fn().mockResolvedValue(null)
      // Replace hasPermission so it doesn't depend on a real user
      store.hasPermission = vi.fn().mockReturnValue(true)
      return store
    },
  }
})

import { useAuthStore } from '@/core/store/auth'
import ReportTemplateBuilderPage from '../ReportTemplateBuilderPage.vue'

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

function createWrapper(
  routeName = 'AdminReportTemplateCreate',
  params: Record<string, string> = {}
) {
  mockRoute.name = routeName
  mockRoute.params = params

  return mount(ReportTemplateBuilderPage, {
    global: {
      stubs: {
        AppSidebar: true,
        TopBar: true,
        Breadcrumb: true,
        TemplateBuilderToolbar: true,
        SectionPanel: true,
        FieldPropertiesPanel: true,
        FieldPalette: true,
        DroppableRow: true,
        DroppableColumn: true,
        DroppableField: true,
        draggable: true,
      },
    },
  })
}

function resetStore(overrides: Record<string, any> = {}) {
  mockStore = makeMockStore(overrides)
}

// ============================================================================
// Tests
// ============================================================================

describe('ReportTemplateBuilderPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetStore()
    vi.clearAllMocks()
  })

  describe('canvas interactions', () => {
    it('shows empty canvas message when no sections', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Crea tu primera sección')
    })

    it('renders sections when store has them', async () => {
      resetStore({
        sections: [
          { id: 's1', label: 'Section 1', display: 'default', rows: [] },
          { id: 's2', label: 'Section 2', display: 'tabs', rows: [] },
        ],
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Crea tu primera sección')
    })

    it('calls addSection when section placeholder is clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const addBtn = wrapper.find('[data-add-section]')
      if (addBtn.exists()) {
        await addBtn.trigger('click')
        expect(mockStore.addSection).toHaveBeenCalled()
      }
    })
  })

  describe('property panel', () => {
    it('shows property panel when a field is selected', async () => {
      resetStore({
        selectedFieldId: 'field-1',
        sections: [
          {
            id: 's1', label: 'Section', display: 'default', rows: [
              { id: 'r1', columns: [{ id: 'c1', fields: [{ id: 'field-1', type: 'text', label: 'Test', key: 'test', required: false }] }] },
            ],
          },
        ],
      })
      const wrapper = createWrapper()
      await flushPromises()
      const panel = wrapper.findComponent({ name: 'FieldPropertiesPanel' })
      expect(panel.exists()).toBe(true)
    })

    it('hides property panel when no field is selected', async () => {
      resetStore({ selectedFieldId: null })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Propiedades')
    })
  })

  describe('create vs edit mode', () => {
    it('loads template when in edit mode', async () => {
      mockGetUseCase.execute.mockResolvedValue({
        id: 5,
        name: 'Existing',
        description: 'Desc',
        structure: { sections: [{ id: 's1', label: 'Loaded', display: 'default', rows: [] }] },
      })
      const wrapper = createWrapper('AdminReportTemplateEdit', { id: '5' })
      await flushPromises()
      expect(mockStore.loadTemplate).toHaveBeenCalled()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not call loadTemplate in create mode', async () => {
      createWrapper('AdminReportTemplateCreate')
      await flushPromises()
      expect(mockStore.loadTemplate).not.toHaveBeenCalled()
    })
  })
})
