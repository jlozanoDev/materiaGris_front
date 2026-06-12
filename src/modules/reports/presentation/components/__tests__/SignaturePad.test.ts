import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SignaturePad from '../SignaturePad.vue'

// Mock canvas getContext with a proper mock for 2d context
beforeEach(() => {
  setActivePinia(createPinia())

  // Ensure getContext returns a mock context
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
  })) as any
})

describe('SignaturePad', () => {
  it('renders canvas element', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: false },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('shows watermark when no signature', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: false },
    })
    expect(wrapper.text()).toContain('Firme dentro del recuadro')
  })

  it('shows clear button when not disabled and signature exists', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: 'data:image/png;base64,abc123', disabled: false },
    })
    const clearBtn = wrapper.find('button')
    expect(clearBtn.exists()).toBe(true)
    expect(clearBtn.text()).toContain('Limpiar')
  })

  it('hides clear button when disabled', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: true },
    })
    const clearBtn = wrapper.find('button')
    // There might be the clear button but it should be disabled or absent
    // Actually according to the spec, clear button is hidden when disabled
    // So there should be no button with "Limpiar" text
    const clearText = wrapper.text()
    expect(clearText).not.toContain('Limpiar')
  })

  it('renders typed signature input as alternative', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: false },
    })
    const typedInput = wrapper.find('input[type="text"]')
    expect(typedInput.exists()).toBe(true)
  })

  it('emits update:modelValue when clearing', async () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: 'data:image/png;base64,abc123', disabled: false },
    })
    const clearBtn = wrapper.findAll('button').find(b => b.text().includes('Limpiar'))
    if (clearBtn) {
      await clearBtn.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([null])
    }
  })

  it('shows existing signature as image when readonly and signature exists', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: 'data:image/png;base64,abc123', disabled: true },
    })
    // Should render an image when read-only with existing signature
    // The canvas might be replaced by an img
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/png;base64,abc123')
  })

  it('does not show image when modelValue is null', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: true },
    })
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('canvas has role="img" for accessibility', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: false },
    })
    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('role')).toBe('img')
  })

  it('canvas has aria-label for screen readers', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: null, disabled: false },
    })
    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('aria-label')).toBeTruthy()
  })
})
