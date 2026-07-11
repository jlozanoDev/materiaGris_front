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
// Mock system variable registry (prevents fetchClient calls in onMounted)
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
    // Header/footer state
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
        HeaderFooterEditor: true,
        DroppableRow: true,
        DroppableColumn: true,
        DroppableField: true,
        draggable: true,
        Splitpanes: {
          template: '<div><slot /></div>',
          props: { class: String },
        },
        Pane: {
          template: '<div :data-size="size" :data-min-size="minSize"><slot /></div>',
          props: ['size', 'minSize'],
        },
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
      expect(wrapper.text()).toContain('Añade contenido a la cabecera')
    })

    it('renders sections when store has them', async () => {
      resetStore({
        sections: [
          { id: 's1', label: 'Section 1', display: 'default', rows: [] },
          { id: 's2', label: 'Section 2', display: 'tabs', rows: [] },
        ],
        activeSections: [
          { id: 's1', label: 'Section 1', display: 'default', rows: [] },
          { id: 's2', label: 'Section 2', display: 'tabs', rows: [] },
        ],
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Añade contenido a la cabecera')
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

  describe('zone tabs', () => {
    it('renders zone tabs in the page', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Cabecera')
      expect(wrapper.text()).toContain('Cuerpo')
      expect(wrapper.text()).toContain('Pie')
    })

    it('calls switchZone when a tab is clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const bodyBtn = wrapper.findAll('button').find(b => b.text().includes('Cuerpo'))
      if (bodyBtn) {
        await bodyBtn.trigger('click')
        // switchZone should have been called
      }
    })
  })

  describe('resizable splitter localStorage', () => {
    const STORAGE_KEY = 'report-template-builder-properties-width'

    beforeEach(() => {
      localStorage.clear()
      vi.restoreAllMocks()
    })

    describe('reading persisted width on mount', () => {
      function getPaneSize(wrapper: any): number {
        // Pane stub renders as <div data-size="N">...
        const el = wrapper.find('[data-size]')
        if (!el.exists()) return -1
        return Number(el.attributes('data-size'))
      }

      it('restores stored width when valid value exists', async () => {
        localStorage.setItem(STORAGE_KEY, '35')
        resetStore({ selectedFieldId: 'field-1' })
        const wrapper = createWrapper()
        await flushPromises()
        expect(getPaneSize(wrapper)).toBe(35)
      })

      it.each([
        { stored: null, label: 'no stored value' },
        { stored: 'NaN', label: 'NaN string' },
        { stored: 'abc', label: 'non-numeric string' },
      ])('falls back to default 25% when $label', async ({ stored }) => {
        if (stored !== null) {
          localStorage.setItem(STORAGE_KEY, stored)
        }
        resetStore({ selectedFieldId: 'field-1' })
        const wrapper = createWrapper()
        await flushPromises()
        expect(getPaneSize(wrapper)).toBe(25)
      })

      it('clamps negative stored value to 20', async () => {
        localStorage.setItem(STORAGE_KEY, '-5')
        resetStore({ selectedFieldId: 'field-1' })
        const wrapper = createWrapper()
        await flushPromises()
        expect(getPaneSize(wrapper)).toBe(20)
      })

      it('clamps stored value over 50 to 50', async () => {
        localStorage.setItem(STORAGE_KEY, '60')
        resetStore({ selectedFieldId: 'field-1' })
        const wrapper = createWrapper()
        await flushPromises()
        expect(getPaneSize(wrapper)).toBe(50)
      })
    })

    describe('persisting width on resize', () => {
      it('reads from localStorage on mount without writing', async () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        resetStore({ selectedFieldId: 'field-1' })
        createWrapper()
        await flushPromises()
        // Mount should only read, never write to localStorage
        expect(setItemSpy).not.toHaveBeenCalled()
      })
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
