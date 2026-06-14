import { ref, type Ref, readonly, type DeepReadonly } from 'vue'
import { SystemVariableRegistry } from '@/shared/types/SystemVariableRegistry'
import type { SystemVarDef } from '@/shared/types/SystemVariableRegistry'
import { fetchClient } from '@/core/api/httpClient'

const API_ENDPOINT = '/admin/system-variables'

const registry = new SystemVariableRegistry()

const loaded: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)

let fetchPromise: Promise<void> | null = null

async function fetchSystemVariables(): Promise<void> {
  if (loaded.value) return
  if (fetchPromise) {
    await fetchPromise
    return
  }

  loading.value = true
  error.value = null

  fetchPromise = (async () => {
    try {
      const raw: unknown = await fetchClient(API_ENDPOINT, { method: 'GET' })
      const data = extractItems(raw)

      if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          if (isValidVarItem(item)) {
            registry.register(item.category, item.key, item.label, item.description)
          }
        }
      } else {
        registerFallbackVariables()
      }
    } catch {
      registerFallbackVariables()
    } finally {
      loaded.value = true
      loading.value = false
      fetchPromise = null
    }
  })()

  await fetchPromise
}

function extractItems(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'data' in raw) return (raw as any).data
  return raw
}

function isValidVarItem(item: unknown): item is { category: string; key: string; label: string; description?: string } {
  return (
    !!item &&
    typeof item === 'object' &&
    typeof (item as any).category === 'string' &&
    typeof (item as any).key === 'string' &&
    typeof (item as any).label === 'string'
  )
}

function registerFallbackVariables(): void {
  registry.register('paciente', 'nombre', 'Nombre del paciente', 'Nombre completo del paciente')
  registry.register('paciente', 'edad', 'Edad', 'Edad del paciente en años')
  registry.register('paciente', 'sexo', 'Sexo', 'Sexo del paciente')
  registry.register('paciente', 'nro_historia', 'Nro. Historia Clínica', 'Número de historia clínica')
  registry.register('clinica', 'nombre', 'Nombre de la clínica', 'Nombre de la clínica o institución')
  registry.register('clinica', 'direccion', 'Dirección', 'Dirección de la clínica')
  registry.register('clinica', 'telefono', 'Teléfono', 'Teléfono de contacto')
  registry.register('fecha', 'actual', 'Fecha actual', 'Fecha del día de hoy')
  registry.register('fecha', 'formato_largo', 'Fecha formato largo', 'Fecha en formato largo (ej: 14 de junio de 2026)')
  registry.register('usuario', 'nombre', 'Nombre del usuario', 'Nombre del profesional que genera el informe')
  registry.register('usuario', 'matricula', 'Matrícula', 'Número de matrícula profesional')
  registry.register('medico', 'nombre', 'Nombre del médico', 'Nombre completo del médico tratante')
  registry.register('medico', 'matricula', 'Matrícula', 'Número de matrícula del médico')
  registry.register('medico', 'especialidad', 'Especialidad', 'Especialidad del médico')
}

function search(prefix: string): SystemVarDef[] {
  return registry.search(prefix)
}

export interface UseSystemVariableRegistryReturn {
  registry: DeepReadonly<SystemVariableRegistry>
  loaded: DeepReadonly<Ref<boolean>>
  loading: DeepReadonly<Ref<boolean>>
  error: DeepReadonly<Ref<string | null>>
  search: (prefix: string) => SystemVarDef[]
  ensureLoaded: () => Promise<void>
}

export const SYSTEM_VARIABLES_KEY = Symbol('systemVariables')

export function useSystemVariableRegistry(): UseSystemVariableRegistryReturn {
  return {
    registry: readonly(registry) as unknown as DeepReadonly<SystemVariableRegistry>,
    loaded: readonly(loaded),
    loading: readonly(loading),
    error: readonly(error),
    search,
    ensureLoaded: fetchSystemVariables,
  }
}
