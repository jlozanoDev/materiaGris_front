import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrintPreviewModal from '../PrintPreviewModal.vue'

describe('PrintPreviewModal', () => {
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
              label: 'Column 1',
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
    return mount(PrintPreviewModal, {
      props: {
        show: true,
        sections: sampleSections,
        ...props,
      },
      global: {
        stubs: {
          AppModal: { template: '<div><slot /><slot name="footer" /></div>' },
          ReportDocumentRenderer: {
            props: ['sections', 'headerSections', 'footerSections', 'headerEnabled', 'footerEnabled', 'values', 'variableResolver'],
            template: '<div class="renderer-stub" />',
            name: 'ReportDocumentRenderer',
          },
        },
      },
    })
  }

  it('passes undefined variableResolver to ReportDocumentRenderer when prop is not provided', () => {
    const wrapper = createWrapper()
    const renderer = wrapper.findComponent({ name: 'ReportDocumentRenderer' })
    expect(renderer.exists()).toBe(true)
    expect(renderer.props('variableResolver')).toBeUndefined()
  })

  it('forwards variableResolver prop to ReportDocumentRenderer', () => {
    const resolver = vi.fn((text: string) => text.replace('{test}', 'RESOLVED'))
    const wrapper = createWrapper({ variableResolver: resolver })

    const renderer = wrapper.findComponent({ name: 'ReportDocumentRenderer' })
    expect(renderer.exists()).toBe(true)
    expect(renderer.props('variableResolver')).toBe(resolver)
  })

  it('shows empty state when sections array is empty', () => {
    const wrapper = mount(PrintPreviewModal, {
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
