import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PreviewModal from '../PreviewModal.vue'

describe('PreviewModal', () => {
  const sampleSections = [
    {
      id: 's1',
      label: 'Section 1',
      display: 'default' as const,
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              fields: [
                {
                  id: 'f1',
                  type: 'fixed_text' as const,
                  label: 'Fixed Text',
                  key: 'fixed_1',
                  text_content: 'Hello {test}',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  function createWrapper(props: Record<string, any> = {}) {
    return mount(PreviewModal, {
      props: {
        show: true,
        sections: sampleSections,
        ...props,
      },
      global: {
        stubs: {
          AppModal: { template: '<div><slot /><slot name="footer" /></div>' },
          DynamicFormRenderer: {
            props: ['sections', 'headerSections', 'footerSections', 'modelValue', 'isEditable', 'variableResolver'],
            template: '<div class="dynamic-form-stub" />',
            name: 'DynamicFormRenderer',
          },
        },
      },
    })
  }

  it('passes undefined variableResolver to DynamicFormRenderer when prop is not provided', () => {
    const wrapper = createWrapper()
    const formRenderer = wrapper.findComponent({ name: 'DynamicFormRenderer' })
    expect(formRenderer.exists()).toBe(true)
    expect(formRenderer.props('variableResolver')).toBeUndefined()
  })

  it('forwards variableResolver prop to DynamicFormRenderer', () => {
    const resolver = vi.fn((text: string) => text.replace('{test}', 'RESOLVED'))
    const wrapper = createWrapper({ variableResolver: resolver })

    const formRenderer = wrapper.findComponent({ name: 'DynamicFormRenderer' })
    expect(formRenderer.exists()).toBe(true)
    expect(formRenderer.props('variableResolver')).toBe(resolver)
  })

  it('shows empty state when sections array is empty', () => {
    const wrapper = mount(PreviewModal, {
      props: {
        show: true,
        sections: [],
      },
      global: {
        stubs: {
          AppModal: {
            template: '<div><slot /><slot name="footer" /></div>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('No hay secciones que previsualizar')
  })
})
