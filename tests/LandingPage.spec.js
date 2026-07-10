import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { routerKey, routeLocationKey } from 'vue-router'
import LandingPage from '@/modules/landing/presentation/pages/LandingPage.vue'

function makeRouter({ push = vi.fn() } = {}) {
  const route = { matched: [], redirectedFrom: undefined, href: '/' }
  const routeLike = { matched: [], href: '/', redirectedFrom: undefined }
  return {
    push,
    replace: vi.fn(),
    resolve: vi.fn().mockReturnValue(routeLike),
    currentRoute: { value: route },
    options: { linkActiveClass: 'router-link-active', linkExactActiveClass: 'router-link-exact-active' },
  }
}

function mountPage(options = {}) {
  const router = makeRouter(options.router)
  const route = { matched: [], redirectedFrom: undefined, href: '/' }
  const wrapper = mount(LandingPage, {
    global: {
      provide: { [routerKey]: router, [routeLocationKey]: route },
      ...options.global,
    },
    ...options,
  })
  return { wrapper, router }
}

describe('LandingPage (maqueta)', () => {
  // ── Mount & Structure ────────────────────────────────────
  describe('mount and structure', () => {
    it('mounts without errors', () => {
      const { wrapper } = mountPage()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders the root wrapper with bg-mg-bg class', () => {
      const { wrapper } = mountPage()
      const root = wrapper.find('.bg-mg-bg')
      expect(root.exists()).toBe(true)
    })

    it('renders all child components', () => {
      const { wrapper } = mountPage()
      const html = wrapper.html()
      // Check key sections are present
      expect(html).toContain('MaterIA Gris')       // Header + Footer
      expect(html).toContain('Solicitar demo gratuita') // Hero + CTA
      expect(html).toContain('Módulos de análisis')     // Modules
      expect(html).toContain('Resultados comprobados')  // Metrics
      expect(html).toContain('Todo en una plataforma') // Security
      expect(html).toContain('Cómo funciona')          // Workflow
      expect(html).toContain('Comienza hoy')            // CTA
    })
  })

  // ── Brand & Navigation ───────────────────────────────────
  describe('brand and navigation', () => {
    it('renders the MaterIA Gris logo and brand name', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('MaterIA Gris')
    })

    it('renders navigation links', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Plataforma')
      expect(wrapper.text()).toContain('Cómo funciona')
    })

    it('renders login and demo buttons', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Acceder')
      expect(wrapper.text()).toContain('Solicitar demo')
    })
  })

  // ── Hero Section ─────────────────────────────────────────
  describe('hero section', () => {
    it('renders the hero title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Tu socio de IA')
      expect(wrapper.text()).toContain('clínica inteligente y humana')
    })

    it('renders the platform tagline', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Plataforma clínica con inteligencia artificial')
    })
  })

  // ── Modules Section ──────────────────────────────────────
  describe('modules section', () => {
    it('renders three module cards', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Generación de Informes Inteligentes')
      expect(wrapper.text()).toContain('Diagnóstico Asistido')
      expect(wrapper.text()).toContain('Consultas Grabadas con IA')
    })
  })

  // ── Metrics Section ──────────────────────────────────────
  describe('metrics section', () => {
    it('renders key metrics', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('+2.400')
      expect(wrapper.text()).toContain('80')
      expect(wrapper.text()).toContain('60')
    })
  })

  // ── Workflow Section ─────────────────────────────────────
  describe('workflow section', () => {
    it('renders the section title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('De la consulta al informe en seis pasos')
    })

    it('renders all 6 workflow step titles', () => {
      const { wrapper } = mountPage()
      const text = wrapper.text()
      expect(text).toContain('Buscar Paciente')
      expect(text).toContain('Elegir Plantilla')
      expect(text).toContain('Grabar Consulta')
      expect(text).toContain('IA Rellena Informe')
      expect(text).toContain('Revisar')
      expect(text).toContain('Firmar')
    })
  })

  // ── FAQ Section ──────────────────────────────────────────
  describe('faq section', () => {
    it('renders the FAQ title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Todo lo que necesitas saber')
    })

    it('renders all 6 FAQ questions', () => {
      const { wrapper } = mountPage()
      const text = wrapper.text()
      expect(text).toContain('¿Qué es MateriaGris?')
      expect(text).toContain('¿Cómo funciona la IA?')
      expect(text).toContain('¿Mis datos están seguros?')
      expect(text).toContain('¿Qué especialidades soporta?')
      expect(text).toContain('¿Se integra con mi HCE?')
      expect(text).toContain('¿Tiene costo?')
    })
  })

  // ── Footer ───────────────────────────────────────────────
  describe('footer', () => {
    it('renders footer content', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Aviso legal')
      expect(wrapper.text()).toContain('Privacidad')
      expect(wrapper.text()).toContain('Términos')
    })
  })
})
