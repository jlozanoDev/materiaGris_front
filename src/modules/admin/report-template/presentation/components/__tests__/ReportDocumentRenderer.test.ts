import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportDocumentRenderer from '../ReportDocumentRenderer.vue'
import type { Section } from '@/shared/types'

function createSectionWithFixedText(textContent: string): { sections: Section[] } {
  return {
    sections: [
      {
        id: 'sec-1',
        label: 'Test',
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                fields: [
                  {
                    id: 'fld-1',
                    key: 'test_field',
                    type: 'fixed_text' as const,
                    label: 'Fixed Text',
                    required: false,
                    text_content: textContent,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}

describe('ReportDocumentRenderer — clinica.logo preview', () => {
  it('renders empty string for clinica.logo in preview mode', () => {
    const { sections } = createSectionWithFixedText('Antes {clinica.logo} Después')

    const wrapper = mount(ReportDocumentRenderer, {
      props: {
        sections,
        values: {},
      },
    })

    // Production code: previewVars includes clinica.logo mapped to ''
    // When interpolated, the placeholder resolves to empty string
    const html = wrapper.html()
    expect(html).toContain('Antes')
    expect(html).toContain('Después')
    expect(html).not.toContain('{clinica.logo}')
  })

  it('renders img tag when variableResolver prop is provided with a logo URL', () => {
    const { sections } = createSectionWithFixedText('Logo: {clinica.logo}')

    const wrapper = mount(ReportDocumentRenderer, {
      props: {
        sections,
        values: {},
        variableResolver: (text: string) => {
          // Variable resolver receives full text with {category.key} patterns
          if (text.includes('{clinica.logo}')) {
            return text.replace('{clinica.logo}', '<img src="https://example.com/logo.png" alt="Logo" style="max-width:100%">')
          }
          return text
        },
      },
    })

    const html = wrapper.html()
    expect(html).toContain('Logo:')
    expect(html).toContain('<img src="https://example.com/logo.png"')
    expect(html).not.toContain('{clinica.logo}')
  })
})
