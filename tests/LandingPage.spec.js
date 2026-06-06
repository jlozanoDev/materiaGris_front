import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { routerKey } from 'vue-router'
import LandingPage from '@/modules/landing/presentation/pages/LandingPage.vue'

function makeRouter({ push = vi.fn() } = {}) {
  const route = { matched: [], redirectedFrom: undefined, href: '/' }
  return { push, replace: vi.fn(), resolve: vi.fn(), currentRoute: { value: route } }
}

function mountPage(options = {}) {
  const router = makeRouter(options.router)
  const wrapper = mount(LandingPage, {
    global: {
      provide: { [routerKey]: router },
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

    it('renders all 9 child components', () => {
      const { wrapper } = mountPage()
      const html = wrapper.html()
      // Check key sections are present
      expect(html).toContain('MaterIA Gris')       // Header + Footer
      expect(html).toContain('Solicitar demo gratuita') // Hero + CTA
      expect(html).toContain('Módulos de análisis')     // Modules
      expect(html).toContain('Resultados comprobados')  // Metrics
      expect(html).toContain('Seguridad e Integración') // Security
      expect(html).toContain('Escala con tus necesidades') // Pricing
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
      expect(wrapper.text()).toContain('Precios')
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
      expect(wrapper.text()).toContain('práctica clínica optimizada y humana')
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
      expect(wrapper.text()).toContain('Gestión Integral del Paciente')
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

  // ── Pricing Section ──────────────────────────────────────
  describe('pricing section', () => {
    it('renders three pricing plans', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Básico')
      expect(wrapper.text()).toContain('Avanzado')
      expect(wrapper.text()).toContain('Hospital')
    })

    it('renders the Recomendado badge on Avanzado as ::before', () => {
      const { wrapper } = mountPage()
      const highlighted = wrapper.find('.pricing-highlight')
      expect(highlighted.exists()).toBe(true)
      // Badge is rendered via CSS ::before pseudo-element
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
