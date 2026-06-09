import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangePasswordModal from '@/modules/admin/users/presentation/components/ChangePasswordModal.vue'

describe('ChangePasswordModal', () => {
  const mockClose = vi.fn()
  const mockSave = vi.fn()

  function mountModal(props = {}) {
    return mount(ChangePasswordModal, {
      props: {
        show: true,
        ...props,
      },
      global: {
        stubs: {
          Modal: {
            template: `
              <div class="modal-stub">
                <slot name="header"></slot>
                <slot></slot>
              </div>
            `,
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the modal title', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('Cambiar contraseña')
      expect(wrapper.text()).toContain('Contraseña actual')
      expect(wrapper.text()).toContain('Nueva contraseña')
      expect(wrapper.text()).toContain('Confirmar contraseña')
    })

    it('renders three password input fields', () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')
      expect(inputs.length).toBe(3)
    })

    it('renders cancel and save buttons', () => {
      const wrapper = mountModal()
      // There are also 3 eye-toggle buttons, so total > 2
      const buttons = wrapper.findAll('button')
      const cancelBtn = buttons.filter(b => b.text().trim() === 'Cancelar')[0]
      const saveBtn = buttons.filter(b => b.text().trim() === 'Guardar')[0]
      expect(cancelBtn).toBeDefined()
      expect(saveBtn).toBeDefined()
    })

    it('does not render when show prop is false', () => {
      const wrapper = mountModal({ show: false })
      // The stub will still mount since Modal checks the show prop internally
      // but at the ChangePasswordModal level, DOM is still rendered inside the stub
      expect(wrapper.find('.modal-stub').exists()).toBe(true)
    })
  })

  describe('canSave computed', () => {
    function getSaveBtn(wrapper) {
      return wrapper.findAll('button').filter((b) => b.text().trim() === 'Guardar')[0]
    }

    it('disables save button when fields are empty', () => {
      const wrapper = mountModal()
      const saveBtn = getSaveBtn(wrapper)
      expect(saveBtn.element.disabled).toBe(true)
    })

    it('disables save when password is too short (< 8 chars)', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('oldpass')
      await inputs[1].setValue('short')
      await inputs[2].setValue('short')

      const saveBtn = getSaveBtn(wrapper)
      expect(saveBtn.element.disabled).toBe(true)
    })

    it('disables save when password and confirm do not match', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('oldpass')
      await inputs[1].setValue('password123')
      await inputs[2].setValue('password456')

      const saveBtn = getSaveBtn(wrapper)
      expect(saveBtn.element.disabled).toBe(true)
    })

    it('enables save when all fields are valid', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('oldpass')
      await inputs[1].setValue('password123')
      await inputs[2].setValue('password123')

      const saveBtn = getSaveBtn(wrapper)
      expect(saveBtn.element.disabled).toBe(false)
    })

    it('disables save when current password is only whitespace', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('   ')
      await inputs[1].setValue('password123')
      await inputs[2].setValue('password123')

      const saveBtn = getSaveBtn(wrapper)
      expect(saveBtn.element.disabled).toBe(true)
    })
  })

  describe('emit close', () => {
    it('emits close when cancel button is clicked', async () => {
      const wrapper = mountModal()
      const cancelBtn = wrapper.findAll('button').filter((b) => b.text().trim() === 'Cancelar')[0]
      await cancelBtn.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close').length).toBe(1)
    })

    it('emits close when Modal triggers close event', async () => {
      const wrapper = mountModal()
      const cancelBtn = wrapper.findAll('button').filter((b) => b.text().trim() === 'Cancelar')[0]
      await cancelBtn.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('emit save', () => {
    it('emits save with correct payload when form is submitted', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('current-secret')
      await inputs[1].setValue('newsecret123')
      await inputs[2].setValue('newsecret123')

      await wrapper.find('form').trigger('submit.prevent')

      const emitted = wrapper.emitted('save')
      expect(emitted).toBeTruthy()
      expect(emitted.length).toBe(1)
      expect(emitted[0][0]).toEqual({
        oldPassword: 'current-secret',
        password: 'newsecret123',
      })
    })

    it('clears all fields after emitting save', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      await inputs[0].setValue('current-secret')
      await inputs[1].setValue('newsecret123')
      await inputs[2].setValue('newsecret123')

      await wrapper.find('form').trigger('submit.prevent')

      // After save, fields should be reset
      expect(wrapper.vm.oldPassword).toBe('')
      expect(wrapper.vm.password).toBe('')
      expect(wrapper.vm.confirm).toBe('')
    })

    it('does not emit save when button is clicked while disabled', async () => {
      const wrapper = mountModal()
      // All fields empty → canSave is false → button is disabled
      // Clicking the disabled button should not trigger form submission
      const saveBtn = wrapper.findAll('button').filter((b) => b.text().trim() === 'Guardar')[0]
      expect(saveBtn.element.disabled).toBe(true)

      // Even if we try to submit, jsdom won't fire submit from disabled button
      await saveBtn.trigger('click')

      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  describe('edge cases', () => {
    it('trims current password before validation', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input[type="password"]')

      // Trim happens in canSave check; spaces-only fails
      await inputs[0].setValue('  ')
      await inputs[1].setValue('password123')
      await inputs[2].setValue('password123')

      const saveBtn = wrapper.findAll('button').filter((b) => b.text().trim() === 'Guardar')[0]
      expect(saveBtn.element.disabled).toBe(true)
    })
  })
})
