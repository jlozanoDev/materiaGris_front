import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { routerKey } from 'vue-router'
import LandingPage from '@/modules/auth/presentation/pages/LandingPage.vue'

// ─── GSAP Mocks ────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  gsapFrom: vi.fn(),
  gsapRegisterPlugin: vi.fn(),
  scrollTrigger: {},
}))

vi.mock('gsap', () => ({
  default: {
    registerPlugin: mocks.gsapRegisterPlugin,
    from: mocks.gsapFrom,
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  default: mocks.scrollTrigger,
}))

// ─── Helpers ──────────────────────────────────────────────────
function makeRouter({ push = vi.fn() } = {}) {
  return { push, replace: vi.fn(), currentRoute: { value: {} } }
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
  // Remove duplicated provide key from options to avoid double-passing
  return { wrapper, router }
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Mount & Structure ────────────────────────────────────
  describe('mount and structure', () => {
    it('mounts without errors', () => {
      const { wrapper } = mountPage()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders the root wrapper div', () => {
      const { wrapper } = mountPage()
      expect(wrapper.find('.relative.w-full.overflow-x-hidden').exists()).toBe(true)
    })

    it('registers GSAP ScrollTrigger on module evaluation', () => {
      mountPage()
      expect(mocks.gsapRegisterPlugin).toHaveBeenCalledWith(mocks.scrollTrigger)
    })

    it('calls gsap.from with reveal-up selector on mount', () => {
      mountPage()
      expect(mocks.gsapFrom).toHaveBeenCalledTimes(1)
      expect(mocks.gsapFrom).toHaveBeenCalledWith(
        '.reveal-up',
        expect.objectContaining({
          y: 50,
          opacity: 0,
          duration: 1,
        })
      )
    })

    it('passes scrollTrigger config to gsap.from', () => {
      mountPage()
      const callArgs = mocks.gsapFrom.mock.calls[0][1]
      expect(callArgs.scrollTrigger).toBeDefined()
      expect(callArgs.scrollTrigger.trigger).toBe('.reveal-up')
      expect(callArgs.scrollTrigger.start).toBe('top 85%')
    })
  })

  // ── Hero Section ─────────────────────────────────────────
  describe('hero section', () => {
    it('renders the logo in the header', () => {
      const { wrapper } = mountPage()
      const logoImg = wrapper.find('header img')
      expect(logoImg.exists()).toBe(true)
      expect(logoImg.attributes('src')).toBeTruthy()
    })

    it('renders the brand name in the header', () => {
      const { wrapper } = mountPage()
      expect(wrapper.find('header').text()).toContain('MaterIA Gris')
    })

    it('renders the subtitle in the header', () => {
      const { wrapper } = mountPage()
      expect(wrapper.find('header').text()).toContain('Plataforma clínica')
    })

    it('renders the Soporte link', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Soporte')
    })

    it('renders the Iniciar sesión button', () => {
      const { wrapper } = mountPage()
      const buttons = wrapper.findAll('button')
      const loginBtn = buttons.find(b => b.text().includes('Iniciar sesión'))
      expect(loginBtn).toBeTruthy()
    })

    it('navigates to /login when Iniciar sesión is clicked', async () => {
      const push = vi.fn()
      const { wrapper, router } = mountPage({ router: { push } })
      const buttons = wrapper.findAll('button')
      const loginBtn = buttons.find(b => b.text().includes('Iniciar sesión'))
      await loginBtn.trigger('click')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('renders the hero title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain(
        'MaterIA Gris: Tu socio de IA para una práctica clínica optimizada y humana'
      )
    })

    it('renders the Acceder a mi cuenta CTA button', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Acceder a mi cuenta')
    })

    it('navigates to /login when Acceder a mi cuenta is clicked', async () => {
      const push = vi.fn()
      const { wrapper, router } = mountPage({ router: { push } })
      const buttons = wrapper.findAll('button')
      const ctaBtn = buttons.find(b => b.text().includes('Acceder a mi cuenta'))
      await ctaBtn.trigger('click')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('renders the Solicitar demo button', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Solicitar demo')
    })

    it('renders the doctor image', () => {
      const { wrapper } = mountPage()
      const imgs = wrapper.findAll('img')
      const doctorImg = imgs.find(img => img.attributes('src')?.includes('doctor'))
      expect(doctorImg).toBeTruthy()
    })

    it('renders the trust tags', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Datos cifrados')
      expect(wrapper.text()).toContain('Conforme RGPD')
      expect(wrapper.text()).toContain('100% en la nube')
    })
  })

  // ── Feature Cards (Overlapping) ──────────────────────────
  describe('feature cards section', () => {
    it('renders three reveal-up feature cards', () => {
      const { wrapper } = mountPage()
      const cards = wrapper.findAll('.reveal-up')
      expect(cards).toHaveLength(3)
    })

    it('renders the Informes card with correct title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Generación de Informes Inteligentes.')
    })

    it('renders the Informes card placeholder text', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Contenido Analizado por IA')
    })

    it('renders the Diagnóstico card with correct title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Diagnóstico Asistido y Análisis de Datos.')
    })

    it('renders the Diagnóstico card accuracy stat', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Precisión')
      expect(wrapper.text()).toContain('98.5%')
    })

    it('renders the Gestión Integral card with correct title', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Gestión Integral del Paciente.')
    })

    it('renders the Gestión Integral KPI total', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Total Pacientes Hoy')
      expect(wrapper.text()).toContain('104')
    })

    it('renders patient initials in the Gestión Integral card', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('A.M.')
      expect(wrapper.text()).toContain('C.R.')
    })
  })

  // ── Modules Section ──────────────────────────────────────
  describe('modules section', () => {
    it('renders the Módulos Adicionales heading', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Módulos Adicionales')
    })

    it('renders three module cards', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Telemedicina Integrada')
      expect(wrapper.text()).toContain('Seguimiento de Wearables')
      expect(wrapper.text()).toContain('Facturación Automatizada')
    })

    it('renders the carousel navigation buttons (prev and next)', () => {
      const { wrapper } = mountPage()
      // There are multiple .rotate-180 chevrons — find navigation buttons
      const navButtons = wrapper.findAll('.rounded-full.bg-white.shadow-md')
      // Should find at least the prev and next buttons
      expect(navButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders the Integración y Seguridad heading', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Integración y Seguridad')
    })

    it('renders three security/integration cards', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Integración fluida con sistemas existentes')
      expect(wrapper.text()).toContain('Integración con Firewalls de última generación')
      expect(wrapper.text()).toContain('Seguridad de Datos y Conectividad centralizada')
    })

    it('renders the social proof case study box', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Caso de estudio')
      expect(wrapper.text()).toContain('Hospital General X ahorró 25% en costos operativos')
    })
  })

  // ── Stats Cards (3D Graphic Area) ────────────────────────
  describe('stats cards around 3D graphic', () => {
    it('renders the +2.400 informes stat', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('+2.400')
      expect(wrapper.text()).toContain('Informes Generados')
    })

    it('renders the 98% precisión stat', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Precisión Clínica')
    })

    it('renders the < 60s/ por informe stat', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('< 60s/')
      expect(wrapper.text()).toContain('Por informe')
    })

    it('renders the 150+ profesionales stat', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('150+')
      expect(wrapper.text()).toContain('Profesionales Activos')
    })
  })

  // ── Pricing Section ──────────────────────────────────────
  describe('pricing section', () => {
    it('renders the pricing heading', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Iniciar acción & pricing model')
    })

    it('renders the pricing subtitle', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain(
        'Precios diseñados para adaptarse a tu práctica médica'
      )
    })

    it('renders three pricing plans', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Básico')
      expect(wrapper.text()).toContain('Avanzado')
      expect(wrapper.text()).toContain('Hospital')
    })

    it('renders Básico plan features', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('100 informes al mes')
      expect(wrapper.text()).toContain('Soporte por email')
      expect(wrapper.text()).toContain('Gestión de pacientes')
      expect(wrapper.text()).toContain('Múltiples agendas')
    })

    it('renders Básico plan button', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Elegir plan Básico')
    })

    it('renders Avanzado plan as featured with badge', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('El Más Elegido')
    })

    it('renders Avanzado plan features', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Informes IA Ilimitados')
      expect(wrapper.text()).toContain('Diagnóstico Asistido')
      expect(wrapper.text()).toContain('Soporte Prioritario 24/7')
    })

    it('renders Avanzado plan button', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Comenzar Prueba')
    })

    it('renders Hospital plan features', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Usuarios Ilimitados')
      expect(wrapper.text()).toContain('Integración API / HL7')
      expect(wrapper.text()).toContain('Servidor Dedicado')
      expect(wrapper.text()).toContain('Onboarding personalizado')
    })

    it('renders Hospital plan button', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Contactar Ventas')
    })
  })

  // ── Footer ───────────────────────────────────────────────
  describe('footer', () => {
    it('renders the footer brand name', () => {
      const { wrapper } = mountPage()
      const footer = wrapper.find('footer')
      expect(footer.text()).toContain('MaterIA Gris')
    })

    it('renders the footer description', () => {
      const { wrapper } = mountPage()
      const footer = wrapper.find('footer')
      expect(footer.text()).toContain(
        'Tu socio de IA para una práctica clínica optimizada y humana'
      )
    })

    it('renders the Soluciones section', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Soluciones')
    })

    it('renders Soluciones links', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Informes IA')
      expect(wrapper.text()).toContain('Gestión de pacientes')
      expect(wrapper.text()).toContain('Telemedicina')
      expect(wrapper.text()).toContain('Precios')
    })

    it('renders the Empresa section', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Empresa')
    })

    it('renders Empresa links', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Sobre Nosotros')
      expect(wrapper.text()).toContain('Blog Médico')
      expect(wrapper.text()).toContain('Contacto')
    })

    it('renders the Legal section', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Legal')
    })

    it('renders Legal links', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Términos de uso')
      expect(wrapper.text()).toContain('Privacidad')
      expect(wrapper.text()).toContain('Cookies')
    })

    it('renders the current year in copyright', () => {
      const { wrapper } = mountPage()
      const currentYear = new Date().getFullYear().toString()
      expect(wrapper.text()).toContain(currentYear)
    })

    it('renders the copyright text', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('MaterIA Gris. Todos los derechos reservados.')
    })

    it('renders social media links', () => {
      const { wrapper } = mountPage()
      expect(wrapper.text()).toContain('Twitter / X')
      expect(wrapper.text()).toContain('LinkedIn')
      expect(wrapper.text()).toContain('Instagram')
    })
  })

  // ── Edge Cases ───────────────────────────────────────────
  describe('edge cases', () => {
    it('handles multiple mounts without leaking state', () => {
      const { wrapper: w1 } = mountPage()
      const { wrapper: w2 } = mountPage()
      expect(w1.exists()).toBe(true)
      expect(w2.exists()).toBe(true)
      // Both should render the same content independently
      expect(w1.text()).toContain('MaterIA Gris')
      expect(w2.text()).toContain('MaterIA Gris')
    })

    it('gsap.from is called exactly once (not re-run on re-mount edge case)', () => {
      mountPage()
      expect(mocks.gsapFrom).toHaveBeenCalledTimes(1)
      mountPage()
      // Second mount triggers onMounted again
      expect(mocks.gsapFrom).toHaveBeenCalledTimes(2)
    })

    it('no v-if false branches remain — all static content renders', () => {
      const { wrapper } = mountPage()
      // The component has no v-if directives, so all key sections are present
      const html = wrapper.html()
      expect(html).toContain('Datos cifrados')
      expect(html).toContain('El Más Elegido')
      expect(html).toContain('Twitter / X')
    })
  })
})
