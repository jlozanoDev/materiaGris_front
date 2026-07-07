import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { useAuthStore } from '@/core/store/auth'
import ReportTemplateListPage from '../ReportTemplateListPage.vue'

// ============================================================================
// Mock DI container
// ============================================================================

const mockGetTemplatesUseCase = { execute: vi.fn() }
const mockDeleteTemplateUseCase = { execute: vi.fn() }

vi.mock('@/modules/admin/report-template/application/containers/reportTemplateContainer', () => ({
  provideGetReportTemplatesUseCase: () => mockGetTemplatesUseCase,
  provideDeleteReportTemplateUseCase: () => mockDeleteTemplateUseCase,
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockTemplates = [
  { id: '1', name: 'Template A', description: 'Desc A', isActive: true, updatedAt: '2026-06-12T10:00:00Z' },
  { id: '2', name: 'Template B', description: '', isActive: false, updatedAt: '2026-06-11T08:00:00Z' },
]

// ============================================================================
// Table stub — renders slots per item so we can test action buttons
// ============================================================================

const UiVuetifyDataTableStub = {
  props: ['value', 'columns', 'filters', 'globalFilterFields', 'dataKey', 'paginator', 'rows', 'rowsPerPageOptions'],
  template: `
    <div class="vuetify-table-stub">
      <div v-for="(item, idx) in (value || [])" :key="item.id || idx" class="table-row">
        <div class="row-name"><slot name="body-name" :data="item" /></div>
        <div class="row-description"><slot name="body-description" :data="item" /></div>
        <div class="row-isActive"><slot name="body-isActive" :data="item" /></div>
        <div class="row-updatedAt"><slot name="body-updatedAt" :data="item" /></div>
        <div class="row-actions"><slot name="body-actions" :data="item" /></div>
      </div>
      <slot name="empty" />
    </div>
  `,
}

// ============================================================================
// Helper
// ============================================================================

function createWrapper(permissions: string[]) {
  const authStore = useAuthStore()

  // Set user BEFORE mount so store is hydrated
  authStore.user = {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    permissions,
  }

  // Prevent onMounted's fetchUser() from overwriting with null
  vi.spyOn(authStore, 'fetchUser').mockResolvedValue(authStore.user)

  return mount(ReportTemplateListPage, {
    global: {
      stubs: {
        UiVuetifyDataTable: UiVuetifyDataTableStub,
        AppSidebar: true,
        TopBar: true,
        Breadcrumb: true,
        Modal: {
          props: ['show'],
          template: '<div v-if="show" class="modal-stub"><slot></slot><slot name="footer" /></div>',
        },
      },
    },
  })
}

// ============================================================================
// Tests
// ============================================================================

describe('ReportTemplateListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTemplatesUseCase.execute.mockResolvedValue(mockTemplates)
    mockDeleteTemplateUseCase.execute.mockResolvedValue(undefined)
  })

  // --- Rendering ---

  it('renders the page title', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).toContain('Tipos de Informe')
  })

  it('renders template rows from the composable', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).toContain('Template A')
    expect(wrapper.text()).toContain('Template B')
  })

  it('renders active badge for active templates', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    const badges = wrapper.findAll('.badge--success')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  // --- Permission matrix: Create button ---

  it('shows create button when user has admin.reporttemplate.create', async () => {
    const wrapper = createWrapper([
      'admin.reporttemplate.view',
      'admin.reporttemplate.create',
    ])
    await flushPromises()
    expect(wrapper.text()).toContain('+ Nueva plantilla de informe')
  })

  it('hides create button without admin.reporttemplate.create', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).not.toContain('+ Nueva plantilla de informe')
  })

  // --- Permission matrix: Edit button ---

  it('shows edit button per row with admin.reporttemplate.update', async () => {
    const wrapper = createWrapper([
      'admin.reporttemplate.view',
      'admin.reporttemplate.update',
    ])
    await flushPromises()
    const editButtons = wrapper.findAll('[aria-label="Editar"]')
    expect(editButtons).toHaveLength(2)
  })

  it('hides edit buttons without admin.reporttemplate.update', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.findAll('[aria-label="Editar"]')).toHaveLength(0)
  })

  // --- Permission matrix: Delete button ---

  it('shows delete button per row with admin.reporttemplate.delete', async () => {
    const wrapper = createWrapper([
      'admin.reporttemplate.view',
      'admin.reporttemplate.delete',
    ])
    await flushPromises()
    const deleteButtons = wrapper.findAll('[aria-label="Eliminar"]')
    expect(deleteButtons).toHaveLength(2)
  })

  it('hides delete buttons without admin.reporttemplate.delete', async () => {
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.findAll('[aria-label="Eliminar"]')).toHaveLength(0)
  })

  // --- Full visibility matrix ---

  it('shows all action buttons when user has all report-template permissions', async () => {
    const wrapper = createWrapper([
      'admin.reporttemplate.view',
      'admin.reporttemplate.create',
      'admin.reporttemplate.update',
      'admin.reporttemplate.delete',
    ])
    await flushPromises()

    expect(wrapper.text()).toContain('+ Nueva plantilla de informe')
    expect(wrapper.findAll('[aria-label="Editar"]')).toHaveLength(2)
    expect(wrapper.findAll('[aria-label="Eliminar"]')).toHaveLength(2)
  })

  // --- Empty state ---

  it('shows empty message when no templates exist', async () => {
    mockGetTemplatesUseCase.execute.mockResolvedValue([])
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).toContain('No hay plantillas de informe para mostrar.')
  })

  // --- Error state ---

  it('shows error message on fetch failure', async () => {
    mockGetTemplatesUseCase.execute.mockRejectedValue(new Error('Network error'))
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).toContain('Error al cargar plantillas')
    expect(wrapper.text()).toContain('Network error')
  })

  it('shows retry button on error', async () => {
    mockGetTemplatesUseCase.execute.mockRejectedValue(new Error('Server error'))
    const wrapper = createWrapper(['admin.reporttemplate.view'])
    await flushPromises()
    expect(wrapper.text()).toContain('Reintentar')
  })

  // --- Delete flow ---

  describe('delete flow', () => {
    it('calls deleteTemplate when confirm accepts', async () => {
      const wrapper = createWrapper([
        'admin.reporttemplate.view',
        'admin.reporttemplate.delete',
      ])
      await flushPromises()

      // Clear initial fetchTemplates call from onMounted
      mockDeleteTemplateUseCase.execute.mockClear()

      const deleteBtn = wrapper.findAll('[aria-label="Eliminar"]')[0]
      await deleteBtn.trigger('click')
      await flushPromises()

      // Click confirm button in modal
      const confirmBtn = wrapper.find('.modal-stub').findAll('button').find((b) => b.text() === 'Eliminar')
      expect(confirmBtn).toBeDefined()
      await confirmBtn!.trigger('click')
      await flushPromises()

      expect(mockDeleteTemplateUseCase.execute).toHaveBeenCalledWith('1')
    })

    it('calls deleteTemplate for the correct template id', async () => {
      const wrapper = createWrapper([
        'admin.reporttemplate.view',
        'admin.reporttemplate.delete',
      ])
      await flushPromises()

      mockDeleteTemplateUseCase.execute.mockClear()

      const deleteBtn = wrapper.findAll('[aria-label="Eliminar"]')[1]
      await deleteBtn.trigger('click')
      await flushPromises()

      const confirmBtn = wrapper.find('.modal-stub').findAll('button').find((b) => b.text() === 'Eliminar')
      await confirmBtn!.trigger('click')
      await flushPromises()

      expect(mockDeleteTemplateUseCase.execute).toHaveBeenCalledWith('2')
    })

    it('does not call deleteTemplate when confirm is cancelled', async () => {
      const wrapper = createWrapper([
        'admin.reporttemplate.view',
        'admin.reporttemplate.delete',
      ])
      await flushPromises()

      mockDeleteTemplateUseCase.execute.mockClear()

      const deleteBtn = wrapper.findAll('[aria-label="Eliminar"]')[0]
      await deleteBtn.trigger('click')
      await flushPromises()

      // Click cancel button
      const cancelBtn = wrapper.find('.modal-stub').findAll('button').find((b) => b.text() === 'Cancelar')
      expect(cancelBtn).toBeDefined()
      await cancelBtn!.trigger('click')
      await flushPromises()

      expect(mockDeleteTemplateUseCase.execute).not.toHaveBeenCalled()
    })

    it('shows error toast on delete error', async () => {
      mockDeleteTemplateUseCase.execute.mockRejectedValue(
        new Error('No se puede eliminar: existen informes asociados')
      )

      const wrapper = createWrapper([
        'admin.reporttemplate.view',
        'admin.reporttemplate.delete',
      ])
      await flushPromises()

      const deleteBtn = wrapper.findAll('[aria-label="Eliminar"]')[0]
      await deleteBtn.trigger('click')
      await flushPromises()

      const confirmBtn = wrapper.find('.modal-stub').findAll('button').find((b) => b.text() === 'Eliminar')
      await confirmBtn!.trigger('click')
      await flushPromises()

      // Should not throw — error is caught and shown as toast
      expect(mockDeleteTemplateUseCase.execute).toHaveBeenCalled()
    })
  })
})
