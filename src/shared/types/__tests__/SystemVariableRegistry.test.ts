import { describe, it, expect } from 'vitest'
import { SystemVariableRegistry } from '../SystemVariableRegistry'

describe('SystemVariableRegistry', () => {
  it('starts empty', () => {
    const reg = new SystemVariableRegistry()
    expect(reg.size).toBe(0)
    expect(reg.getAll()).toEqual([])
  })

  it('registers a variable', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre completo')
    expect(reg.size).toBe(1)
    expect(reg.get('paciente.nombre')).toBeDefined()
    expect(reg.get('paciente.nombre')?.label).toBe('Nombre completo')
  })

  it('throws when registering duplicate', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre')
    expect(() => reg.register('paciente', 'nombre', 'Otro')).toThrow(/already registered/)
  })

  it('resolves a variable', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre', undefined, () => 'Juan Pérez')
    expect(reg.resolve('paciente.nombre')).toBe('Juan Pérez')
  })

  it('returns undefined for unknown variable', () => {
    const reg = new SystemVariableRegistry()
    expect(reg.resolve('foo.bar')).toBeUndefined()
  })

  it('interpolates text with variables', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre', undefined, () => 'Juan')
    reg.register('paciente', 'edad', 'Edad', undefined, () => '34')

    const result = reg.interpolate('Paciente: {paciente.nombre}, Edad: {paciente.edad}')
    expect(result).toBe('Paciente: Juan, Edad: 34')
  })

  it('leaves unknown variables as literals', () => {
    const reg = new SystemVariableRegistry()
    const result = reg.interpolate('Dato: {foo.bar}')
    expect(result).toBe('Dato: {foo.bar}')
  })

  it('searches by prefix', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre')
    reg.register('paciente', 'edad', 'Edad')
    reg.register('clinica', 'nombre', 'Clínica')

    const results = reg.search('pac')
    expect(results).toHaveLength(2)
    const keys = results.map((r) => `${r.category}.${r.key}`)
    expect(keys).toContain('paciente.nombre')
    expect(keys).toContain('paciente.edad')
  })

  it('returns empty array for no matches', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre')
    expect(reg.search('xyz')).toEqual([])
  })

  it('returns empty array for empty prefix', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre')
    expect(reg.search('')).toEqual([])
  })

  it('gets variables by category', () => {
    const reg = new SystemVariableRegistry()
    reg.register('paciente', 'nombre', 'Nombre')
    reg.register('paciente', 'edad', 'Edad')
    reg.register('clinica', 'nombre', 'Clínica')

    const pacienteVars = reg.getByCategory('paciente')
    expect(pacienteVars).toHaveLength(2)

    const clinicaVars = reg.getByCategory('clinica')
    expect(clinicaVars).toHaveLength(1)

    const unknownVars = reg.getByCategory('inexistente')
    expect(unknownVars).toEqual([])
  })

  it('returns categories', () => {
    const reg = new SystemVariableRegistry()
    const cats = reg.getCategories()
    expect(cats).toContain('paciente')
    expect(cats).toContain('clinica')
    expect(cats).toContain('fecha')
    expect(cats).toContain('usuario')
  })
})
