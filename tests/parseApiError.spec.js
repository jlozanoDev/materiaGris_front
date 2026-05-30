import { describe, it, expect } from 'vitest'
import { parseApiError } from '@/shared/utils/parseApiError'

describe('parseApiError', () => {
  it('devuelve mensaje por defecto si err es null/undefined', () => {
    expect(parseApiError(null)).toBe('Ha ocurrido un error.')
    expect(parseApiError(undefined)).toBe('Ha ocurrido un error.')
    expect(parseApiError(false)).toBe('Ha ocurrido un error.')
  })

  it('extrae mensaje de body string sin HTML', () => {
    const err = { body: 'Error <b>grave</b>' }
    expect(parseApiError(err)).toBe('Error grave')
  })

  it('extrae mensaje de body JSON', () => {
    const err = { body: '{"message":"Email inválido"}' }
    expect(parseApiError(err)).toBe('Email inválido')
  })

  it('usa el body string si no es JSON parseable', () => {
    const err = { body: 'Server Error' }
    expect(parseApiError(err)).toBe('Server Error')
  })

  it('extrae message de body objeto', () => {
    const err = { body: { message: 'No autorizado' } }
    expect(parseApiError(err)).toBe('No autorizado')
  })

  it('junta errores de body.errors', () => {
    const err = { body: { errors: { email: ['Requerido'], password: ['Mínimo 8'] } } }
    expect(parseApiError(err)).toBe('Requerido Mínimo 8')
  })

  it('devuelve el body como string si no tiene message ni errors', () => {
    const err = { body: { code: 500 } }
    expect(parseApiError(err)).toBe('{"code":500}')
  })

  it('maneja status 401', () => {
    const err = { status: 401 }
    expect(parseApiError(err)).toBe('No autorizado. Inténtalo de nuevo.')
  })

  it('usa err.message si no hay body', () => {
    const err = { message: 'Error de red' }
    expect(parseApiError(err)).toBe('Error de red')
  })

  it('fallback si no hay message ni body', () => {
    const err = { status: 500 }
    expect(parseApiError(err)).toBe('No se pudo conectar con el servidor')
  })
})
