import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Import after mocks
let useReportVariableResolver

describe('useReportVariableResolver', () => {
  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/shared/composables/useReportVariableResolver')
    useReportVariableResolver = mod.useReportVariableResolver
  })

  function createUser(overrides = {}) {
    return {
      id: 1,
      name: 'Dr. Juan Pérez',
      email: 'juan@example.com',
      permissions: [],
      apellido: 'Pérez',
      num_colegiado: '12345',
      especialidad: 'Cardiología',
      telefono: '555-6789',
      ...overrides,
    }
  }

  function createClinic(overrides = {}) {
    return {
      id: 1,
      nombre: 'Clínica Central',
      direccion: 'Av. Corrientes 2000',
      telefono: '555-0000',
      email: 'info@central.com',
      ciudad: 'Buenos Aires',
      provincia: 'CABA',
      codigo_postal: '1045',
      web: 'https://central.com',
      cuit: '30-98765432-1',
      ...overrides,
    }
  }

  function createPatient(overrides = {}) {
    return {
      id: 1,
      first_name: 'Ana',
      last_name: 'García',
      second_last_name: 'López',
      gender: 'Femenino',
      date_of_birth: '1990-05-15',
      city: 'Buenos Aires',
      phone: '555-1111',
      email: 'ana@example.com',
      address_line1: 'Calle Falsa 123',
      medical_record_number: 'HC-001',
      national_id: 'DNI-12345678',
      ...overrides,
    }
  }

  describe('resolve function', () => {
    it('resolves {medico.nombre} from user name', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.nombre}')).toBe('Dr. Juan Pérez')
    })

    it('resolves {usuario.nombre} from user name', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{usuario.nombre}')).toBe('Dr. Juan Pérez')
    })

    it('resolves {medico.apellido} from user apellido', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.apellido}')).toBe('Pérez')
    })

    it('resolves {medico.matricula} from user num_colegiado (FIX: not email)', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      // Should use num_colegiado, NOT email
      expect(resolve('{medico.matricula}')).toBe('12345')
      expect(resolve('{medico.matricula}')).not.toBe('juan@example.com')
    })

    it('resolves {medico.nro_colegiado} from user num_colegiado', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.nro_colegiado}')).toBe('12345')
    })

    it('resolves {medico.especialidad} from user especialidad', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.especialidad}')).toBe('Cardiología')
    })

    it('resolves {medico.telefono} from user telefono', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.telefono}')).toBe('555-6789')
    })

    it('resolves {clinica.nombre} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.nombre}')).toBe('Clínica Central')
    })

    it('resolves {clinica.direccion} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.direccion}')).toBe('Av. Corrientes 2000')
    })

    it('resolves {clinica.telefono} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.telefono}')).toBe('555-0000')
    })

    it('resolves {clinica.email} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.email}')).toBe('info@central.com')
    })

    it('resolves {clinica.ciudad} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.ciudad}')).toBe('Buenos Aires')
    })

    it('resolves {clinica.provincia} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.provincia}')).toBe('CABA')
    })

    it('resolves {clinica.codigo_postal} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.codigo_postal}')).toBe('1045')
    })

    it('resolves {clinica.web} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.web}')).toBe('https://central.com')
    })

    it('resolves {clinica.cuit} from clinic', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.cuit}')).toBe('30-98765432-1')
    })
  })

  describe('null/undefined fields', () => {
    it('returns "—" for null user apellido', () => {
      const user = ref(createUser({ apellido: null }))
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.apellido}')).toBe('—')
    })

    it('returns "—" for null user num_colegiado', () => {
      const user = ref(createUser({ num_colegiado: null }))
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.matricula}')).toBe('—')
      expect(resolve('{medico.nro_colegiado}')).toBe('—')
    })

    it('returns "—" for null clinic fields', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic({ web: null }))
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.web}')).toBe('—')
    })

    it('returns "—" for null clinic', () => {
      const user = ref(createUser())
      const clinic = ref(null)
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.nombre}')).toBe('—')
      expect(resolve('{clinica.direccion}')).toBe('—')
      expect(resolve('{clinica.telefono}')).toBe('—')
    })

    it('returns "—" for null user', () => {
      const user = ref(null)
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.nombre}')).toBe('—')
      expect(resolve('{medico.apellido}')).toBe('—')
    })
  })

  describe('reactive updates', () => {
    it('updates resolved value when clinic ref changes', () => {
      const user = ref(createUser())
      const clinic = ref(createClinic({ nombre: 'Clínica Original' }))
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{clinica.nombre}')).toBe('Clínica Original')

      clinic.value = createClinic({ nombre: 'Clínica Modificada' })
      expect(resolve('{clinica.nombre}')).toBe('Clínica Modificada')
    })

    it('updates resolved value when user ref changes', () => {
      const user = ref(createUser({ name: 'Dr. Original' }))
      const clinic = ref(createClinic())
      const { resolve } = useReportVariableResolver(user, clinic)

      expect(resolve('{medico.nombre}')).toBe('Dr. Original')

      user.value = createUser({ name: 'Dr. Nuevo' })
      expect(resolve('{medico.nombre}')).toBe('Dr. Nuevo')
    })
  })
})
