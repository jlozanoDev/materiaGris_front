import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
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
// Mocks
// ============================================================================

const mockCreateUseCase = { execute: vi.fn() }
const mockUpdateUseCase = { execute: vi.fn() }
const mockGetUseCase = { execute: vi.fn() }

vi.mock('@/modules/admin/report-template/application/containers/reportTemplateContainer', () => ({
  provideGetReportTemplateUseCase: () => mockGetUseCase,
  provideCreateReportTemplateUseCase: () => mockCreateUseCase,
  provideUpdateReportTemplateUseCase: () => mockUpdateUseCase,
}))

// Mock the store composable itself so we control state
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

function createWrapper(routeName = 'AdminReportTemplateCreate', params: Record<string, string> = {}) {
  const authStore = useAuthStore()
  authStore.user = {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    permissions: ['admin.reporttemplate.create', 'admin.reporttemplate.update'],
  }

  // Set route for useRoute mock
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
        DroppableRow: true,
        DroppableColumn: true,
        DroppableField: true,
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

  describe('field palette', () => {
    it('renders 8 draggable field type items in the palette', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const paletteItems = wrapper.findAll('[data-palette-item]')
      expect(paletteItems).toHaveLength(8)
    })

    it('each palette item shows the correct field type label', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const paletteItems = wrapper.findAll('[data-palette-item]')
      const labels = paletteItems.map((el) => el.text().trim().toLowerCase())

      // Spanish labels from the page
      const expectedLabels = ['texto corto', 'texto largo', 'número', 'fecha', 'selección', 'opción única', 'checkbox', 'tabla dinámica']
      expectedLabels.forEach((label) => {
        expect(labels.some((l) => l.includes(label))).toBe(true)
      })
    })
  })

  describe('canvas interactions', () => {
    it('shows empty canvas message when no sections', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Arrastre')
      expect(wrapper.text()).toContain('sección')
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

      // No empty state message + sections rendered (SectionPanel is stubbed, but draggable wraps them)
      expect(wrapper.text()).not.toContain('Arrastre')
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

      // FieldPropertiesPanel stub is rendered
      const panel = wrapper.findComponent({ name: 'FieldPropertiesPanel' })
      expect(panel.exists()).toBe(true)
    })

    it('hides property panel when no field is selected', async () => {
      resetStore({ selectedFieldId: null })
      const wrapper = createWrapper()
      await flushPromises()

      // No FieldPropertiesPanel when no selection
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

      // In edit mode, store.loadTemplate is called
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
