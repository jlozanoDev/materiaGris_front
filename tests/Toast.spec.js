import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '@/shared/components/Toast.vue'

vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({
    dismiss: vi.fn(),
    toasts: [],
    show: vi.fn(),
  }),
}))

describe('Toast', () => {
  it('renderiza el mensaje', () => {
    const wrapper = mount(Toast, { props: { message: 'Operación exitosa', type: 'success' } })
    expect(wrapper.text()).toContain('Operación exitosa')
  })

  it('usa type success por defecto', () => {
    const wrapper = mount(Toast, { props: { message: 'Test' } })
    expect(wrapper.find('.toast--success').exists()).toBe(true)
  })

  it('aplica clase según type', () => {
    const wrapper = mount(Toast, { props: { message: 'Error', type: 'error' } })
    expect(wrapper.find('.toast--error').exists()).toBe(true)
  })

  it('tiene role status y aria-live polite', () => {
    const wrapper = mount(Toast, { props: { message: 'Info' } })
    const el = wrapper.find('[role="status"]')
    expect(el.attributes('aria-live')).toBe('polite')
  })

  it('muestra el botón de cerrar', () => {
    const wrapper = mount(Toast, { props: { message: 'Test' } })
    expect(wrapper.find('.toast-close').exists()).toBe(true)
  })

  it('renderiza clase con el type aunque sea inválido', () => {
    const wrapper = mount(Toast, { props: { message: 'Test', type: 'invalid' } })
    // La clase CSS usa el type prop, no safeType. safeType solo afecta al icono.
    expect(wrapper.find('.toast--invalid').exists()).toBe(true)
  })
})
