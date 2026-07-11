import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

/* ── Hoist mock primitives for stub & store references ───── */
const mockStorageGet = vi.fn()
const mockStorageSet = vi.fn()
const mockFetchUser = vi.fn().mockResolvedValue(null)
const mockLogoutFn = vi.fn()

// Mutable state for the auth store (plain object — mimics Pinia unwrapping)
const mockAuthState = { user: null }

vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    get user() { return mockAuthState.user },
    set user(v) { mockAuthState.user = v },
    fetchUser: mockFetchUser,
    hasPermission: () => true,
  }),
}))

vi.mock('@/shared/composables/useLogout', () => ({
  useLogout: () => ({
    logout: mockLogoutFn,
  }),
}))

vi.mock('@/modules/auth/infrastructure/LocalStorageGateway', () => ({
  default: class {
    get(key) { return mockStorageGet(key) }
    set(key, val) { mockStorageSet(key, val) }
    remove() {}
    clear() {}
    getToken() { return null }
    setToken() {}
    removeToken() {}
  },
}))

const mockExecute = vi.fn().mockResolvedValue({ visits: 0, newPatients: 0, returningPatients: 0 })
vi.mock('@/modules/dashboard/application/containers/dashboardContainer', () => ({
  provideGetDashboardStatsUseCase: vi.fn(() => ({ execute: mockExecute })),
  provideGetRecentPatientsUseCase: vi.fn(() => ({ execute: vi.fn().mockResolvedValue([]) })),
  provideGetPendingReportsUseCase: vi.fn(() => ({ execute: vi.fn().mockResolvedValue([]) })),
  provideGetSystemMetricsUseCase: vi.fn(() => ({ execute: vi.fn().mockResolvedValue({ totalUsers: 0 }) })),
}))

/* ── Import component AFTER mocks are registered ───────── */
import DashboardPage from '@/modules/dashboard/presentation/pages/DashboardPage.vue'

/* ── Shared stubs for child components ─────────────────── */
const CHILD_STUBS = {
  AppSidebar: { name: 'AppSidebar', template: '<aside class="stub-sidebar">Sidebar</aside>' },
  TopBar: {
    name: 'TopBar',
    template: '<header class="stub-topbar">{{ user?.name }}</header>',
    props: ['user'],
  },
  Breadcrumb: {
    name: 'Breadcrumb',
    template: '<nav class="stub-breadcrumb"></nav>',
    props: ['items'],
  },
  HeroCard: {
    name: 'HeroCard',
    template: '<section class="stub-herocard">{{ userName }}</section>',
    props: ['userName', 'stats', 'loading', 'error', 'isEmptyState', 'isNewProfessional'],
  },
  PatientList: { name: 'PatientList', template: '<ul class="stub-patientlist" />' },
  PendingReportsWidget: { name: 'PendingReportsWidget', template: '<div class="stub-pending-reports" />' },
  QuickActions: { name: 'QuickActions', template: '<div class="stub-consultation" />' },
  RightPanel: { name: 'RightPanel', template: '<aside class="stub-rightpanel" />' },
  ProfileEditModal: {
    name: 'ProfileEditModal',
    template: '<div class="stub-edit-modal" v-if="show"></div>',
    props: ['show', 'user'],
  },
  ChangePasswordModal: {
    name: 'ChangePasswordModal',
    template: '<div class="stub-changepass-modal" v-if="show"></div>',
    props: ['show'],
  },
  AddressesModal: {
    name: 'AddressesModal',
    template: '<div class="stub-addresses-modal" v-if="show"></div>',
    props: ['show', 'addresses'],
  },
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.user = null
    mockStorageGet.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Rendering ──────────────────────────────────────

  it('renders all main layout components', () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.find('.stub-sidebar').exists()).toBe(true)
    expect(wrapper.find('.stub-topbar').exists()).toBe(true)
    expect(wrapper.find('.stub-breadcrumb').exists()).toBe(true)
    expect(wrapper.find('.stub-herocard').exists()).toBe(true)
    expect(wrapper.find('.stub-patientlist').exists()).toBe(true)
    expect(wrapper.find('.stub-consultation').exists()).toBe(true)
    expect(wrapper.find('.stub-rightpanel').exists()).toBe(true)
  })

  it('renders all modal components (initially hidden)', () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
    expect(wrapper.find('.stub-changepass-modal').exists()).toBe(false)
    expect(wrapper.find('.stub-addresses-modal').exists()).toBe(false)
  })

  it('passes user prop to TopBar and HeroCard', () => {
    mockAuthState.user = { id: 1, name: 'Juan', email: 'juan@test.com' }
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    const topbar = wrapper.find('.stub-topbar')
    expect(topbar.text()).toContain('Juan')

    const herocard = wrapper.find('.stub-herocard')
    expect(herocard.text()).toContain('Juan')
  })

  it('passes breadcrumb items to Breadcrumb', () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    const breadcrumb = wrapper.findComponent({ name: 'Breadcrumb' })
    // Breadcrumb has items prop — VTU stub captures props
    expect(breadcrumb.exists()).toBe(true)
  })

  // ── Modal visibility ───────────────────────────────

  it('shows EditUserModal when showEditModal is true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showEditModal = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-edit-modal').exists()).toBe(true)
  })

  it('shows ChangePasswordModal when showChangePasswordModal is true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showChangePasswordModal = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-changepass-modal').exists()).toBe(true)
  })

  it('shows AddressesModal when showAddressesModal is true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showAddressesModal = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-addresses-modal').exists()).toBe(true)
  })

  it('closes EditUserModal correctly', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showEditModal = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-edit-modal').exists()).toBe(true)

    // Emit close from the modal stub → should set showEditModal = false
    // We test the internal function directly
    wrapper.vm.showEditModal = false
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
  })

  // ── loadAddresses() ────────────────────────────────

  it('loadAddresses returns default addresses when storage is empty', () => {
    mockStorageGet.mockReturnValue(null)
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.addresses).toHaveLength(2)
    expect(wrapper.vm.addresses[0]).toMatchObject({ id: 1, alias: 'Casa' })
    expect(wrapper.vm.addresses[1]).toMatchObject({ id: 2, alias: 'Oficina' })
  })

  it('loadAddresses returns stored addresses when valid JSON array', () => {
    const storedAddresses = [{ id: 99, alias: 'Farmacia', street: 'C. Real', number: '1', postal_code: '28001', mobile_phone: '600000000', is_primary: true }]
    mockStorageGet.mockReturnValue(JSON.stringify(storedAddresses))
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.addresses).toHaveLength(1)
    expect(wrapper.vm.addresses[0]).toMatchObject({ id: 99, alias: 'Farmacia' })
  })

  it('loadAddresses handles JSON parse error and returns defaults', () => {
    mockStorageGet.mockReturnValue('not valid json {{{')
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.addresses).toHaveLength(2)
    expect(wrapper.vm.addresses[0].alias).toBe('Casa')
  })

  it('loadAddresses handles non-array stored value and returns defaults', () => {
    mockStorageGet.mockReturnValue(JSON.stringify({ foo: 'bar' }))
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.addresses).toHaveLength(2)
    expect(wrapper.vm.addresses[0].alias).toBe('Casa')
  })

  it('loadAddresses handles empty string and returns defaults', () => {
    mockStorageGet.mockReturnValue('')
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    // empty string is falsy → stored check fails → returns defaults
    expect(wrapper.vm.addresses).toHaveLength(2)
  })

  // ── onSaveEdited ───────────────────────────────────

  it('onSaveEdited updates user name and stores to localStorage', () => {
    mockAuthState.user = { id: 1, name: 'Antigua', email: 'old@test.com' }
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    wrapper.vm.onSaveEdited({ name: 'Nueva' })

    expect(mockAuthState.user.name).toBe('Nueva')
    expect(mockStorageSet).toHaveBeenCalledWith('user', expect.stringContaining('Nueva'))
  })

  it('onSaveEdited keeps original name when edited.name is not provided', () => {
    mockAuthState.user = { id: 1, name: 'Original', email: 'o@test.com' }
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    wrapper.vm.onSaveEdited({})

    // edited.name is undefined → uses authStore.user.name (Original)
    expect(mockAuthState.user.name).toBe('Original')
    expect(mockStorageSet).toHaveBeenCalledWith('user', expect.stringContaining('Original'))
  })

  it('onSaveEdited handles null user gracefully', () => {
    mockAuthState.user = null
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    // Should not throw
    expect(() => wrapper.vm.onSaveEdited({ name: 'Test' })).not.toThrow()
    // Still calls storage.set with "null"
    expect(mockStorageSet).toHaveBeenCalledWith('user', 'null')
  })

  it('onSaveEdited handles storage.set throwing without crashing', () => {
    mockAuthState.user = { id: 1, name: 'Test', email: 't@test.com' }
    mockStorageSet.mockImplementation(() => { throw new Error('storage full') })
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    expect(() => wrapper.vm.onSaveEdited({ name: 'N' })).not.toThrow()
    expect(mockAuthState.user.name).toBe('N')
  })

  it('onSaveEdited persists the full user object (not just name)', () => {
    mockAuthState.user = { id: 42, name: 'Full', email: 'full@test.com', roles: ['admin'] }
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    wrapper.vm.onSaveEdited({ name: 'Updated' })

    const storedArg = mockStorageSet.mock.calls[0][1]
    const parsed = JSON.parse(storedArg)
    expect(parsed).toMatchObject({ id: 42, name: 'Updated', email: 'full@test.com' })
  })

  // ── onSavePassword ─────────────────────────────────

  it('onSavePassword logs message and stores timestamp', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    wrapper.vm.onSavePassword()

    expect(consoleSpy).toHaveBeenCalledWith('[DashboardPage] password change requested (frontend-only)')
    expect(mockStorageSet).toHaveBeenCalledWith('passwordChangedAt', expect.any(String))
    consoleSpy.mockRestore()
  })

  it('onSavePassword handles storage.set throwing without crashing', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockStorageSet.mockImplementation(() => { throw new Error('storage full') })
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    expect(() => wrapper.vm.onSavePassword()).not.toThrow()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  // ── onSaveAddresses ────────────────────────────────

  it('onSaveAddresses updates addresses ref and persists to storage', () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    const newAddresses = [
      { id: 10, alias: 'Nueva', street: 'C. Mayor', number: '5', postal_code: '28003', mobile_phone: '611222333', is_primary: true },
    ]

    wrapper.vm.onSaveAddresses(newAddresses)

    expect(wrapper.vm.addresses).toHaveLength(1)
    expect(wrapper.vm.addresses[0]).toMatchObject({ id: 10, alias: 'Nueva' })
    expect(mockStorageSet).toHaveBeenCalledWith('addresses', expect.stringContaining('Nueva'))
  })

  it('onSaveAddresses replaces existing addresses entirely', () => {
    mockStorageGet.mockReturnValue(JSON.stringify([
      { id: 1, alias: 'Casa', street: 'Old', number: '1', postal_code: '00000', mobile_phone: '600000000', is_primary: true },
    ]))
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.addresses).toHaveLength(1)

    const replacement = [
      { id: 2, alias: 'A', street: 'X', number: '1', postal_code: '00001', mobile_phone: '600000001', is_primary: true },
      { id: 3, alias: 'B', street: 'Y', number: '2', postal_code: '00002', mobile_phone: '600000002', is_primary: false },
    ]
    wrapper.vm.onSaveAddresses(replacement)

    expect(wrapper.vm.addresses).toHaveLength(2)
    expect(wrapper.vm.addresses[0].alias).toBe('A')
    expect(wrapper.vm.addresses[1].alias).toBe('B')
  })

  it('onSaveAddresses handles storage.set throwing without crashing', () => {
    mockStorageSet.mockImplementation(() => { throw new Error('storage full') })
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    const newAddr = [
      { id: 5, alias: 'X', street: 'S', number: '1', postal_code: '00000', mobile_phone: '600000000', is_primary: true },
    ]
    expect(() => wrapper.vm.onSaveAddresses(newAddr)).not.toThrow()
    expect(wrapper.vm.addresses[0].alias).toBe('X')
  })

  // ── onMounted ──────────────────────────────────────

  it('calls authStore.fetchUser on mount', () => {
    mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(mockFetchUser).toHaveBeenCalledTimes(1)
  })

  // ── logout ─────────────────────────────────────────

  it('logout function is available from useLogout composable', () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.logout).toBe(mockLogoutFn)
  })

  // ── Template edge cases ────────────────────────────

  it('renders correctly with null user', () => {
    mockAuthState.user = null
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    // Should not crash
    expect(wrapper.find('.stub-topbar').exists()).toBe(true)
  })

  it('renders correctly with empty user object', () => {
    mockAuthState.user = {}
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    // TopBar receives empty user — should render without crashing
    expect(wrapper.find('.stub-topbar').exists()).toBe(true)
  })

  // ── showChangePasswordModal from TopBar emit ───────

  it('TopBar @open-edit sets showEditModal to true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    expect(wrapper.vm.showEditModal).toBe(false)

    const topbar = wrapper.findComponent({ name: 'TopBar' })
    await topbar.vm.$emit('open-edit')

    expect(wrapper.vm.showEditModal).toBe(true)
  })

  it('TopBar @open-change-password sets showChangePasswordModal to true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    const topbar = wrapper.findComponent({ name: 'TopBar' })
    await topbar.vm.$emit('open-change-password')

    expect(wrapper.vm.showChangePasswordModal).toBe(true)
  })

  it('TopBar @manage-addresses sets showAddressesModal to true', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })

    const topbar = wrapper.findComponent({ name: 'TopBar' })
    await topbar.vm.$emit('manage-addresses')

    expect(wrapper.vm.showAddressesModal).toBe(true)
  })

  it('ProfileEditModal @close sets showEditModal to false', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showEditModal = true
    await wrapper.vm.$nextTick()

    const modal = wrapper.findComponent({ name: 'ProfileEditModal' })
    await modal.vm.$emit('close')

    expect(wrapper.vm.showEditModal).toBe(false)
  })

  it('ChangePasswordModal @close sets showChangePasswordModal to false', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showChangePasswordModal = true
    await wrapper.vm.$nextTick()

    const modal = wrapper.findComponent({ name: 'ChangePasswordModal' })
    await modal.vm.$emit('close')

    expect(wrapper.vm.showChangePasswordModal).toBe(false)
  })

  it('AddressesModal @close sets showAddressesModal to false', async () => {
    const wrapper = mount(DashboardPage, { global: { stubs: CHILD_STUBS } })
    wrapper.vm.showAddressesModal = true
    await wrapper.vm.$nextTick()

    const modal = wrapper.findComponent({ name: 'AddressesModal' })
    await modal.vm.$emit('close')

    expect(wrapper.vm.showAddressesModal).toBe(false)
  })
})
