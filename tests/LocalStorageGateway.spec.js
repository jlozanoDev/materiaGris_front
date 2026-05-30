import { describe, it, expect, beforeEach, vi } from 'vitest'
import LocalStorageGateway from '@/modules/auth/infrastructure/LocalStorageGateway'

describe('LocalStorageGateway', () => {
  let gateway

  beforeEach(() => {
    localStorage.clear()
    gateway = new LocalStorageGateway()
  })

  describe('get', () => {
    it('devuelve el valor guardado', () => {
      localStorage.setItem('test', 'hello')
      expect(gateway.get('test')).toBe('hello')
    })

    it('devuelve null si la clave no existe', () => {
      expect(gateway.get('missing')).toBeNull()
    })
  })

  describe('set', () => {
    it('guarda un valor string', () => {
      gateway.set('key', 'value')
      expect(localStorage.getItem('key')).toBe('value')
    })

    it('convierte valores no string', () => {
      gateway.set('num', 42)
      expect(localStorage.getItem('num')).toBe('42')
    })
  })

  describe('remove', () => {
    it('elimina una clave existente', () => {
      localStorage.setItem('tmp', 'data')
      gateway.remove('tmp')
      expect(localStorage.getItem('tmp')).toBeNull()
    })

    it('no falla si la clave no existe', () => {
      expect(() => gateway.remove('nope')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('limpia todas las claves', () => {
      localStorage.setItem('a', '1')
      localStorage.setItem('b', '2')
      gateway.clear()
      expect(localStorage.length).toBe(0)
    })
  })

  describe('getToken', () => {
    it('devuelve el access_token guardado', () => {
      localStorage.setItem('access_token', 'token-xyz')
      expect(gateway.getToken()).toBe('token-xyz')
    })

    it('devuelve null si no hay token', () => {
      expect(gateway.getToken()).toBeNull()
    })
  })

  describe('setToken', () => {
    it('guarda el token en access_token', () => {
      gateway.setToken('new-token')
      expect(localStorage.getItem('access_token')).toBe('new-token')
    })
  })

  describe('removeToken', () => {
    it('elimina el access_token', () => {
      localStorage.setItem('access_token', 'old')
      gateway.removeToken()
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  describe('fallback en errores de localStorage', () => {
    it('get retorna null si localStorage.getItem lanza', () => {
      const orig = localStorage.getItem
      localStorage.getItem = vi.fn(() => { throw new Error('quota') })
      expect(gateway.get('any')).toBeNull()
      localStorage.getItem = orig
    })

    it('set no lanza aunque falle', () => {
      const orig = localStorage.setItem
      localStorage.setItem = vi.fn(() => { throw new Error('quota') })
      expect(() => gateway.set('x', 'y')).not.toThrow()
      localStorage.setItem = orig
    })

    it('remove no lanza aunque falle', () => {
      const orig = localStorage.removeItem
      localStorage.removeItem = vi.fn(() => { throw new Error('quota') })
      expect(() => gateway.remove('x')).not.toThrow()
      localStorage.removeItem = orig
    })

    it('clear no lanza aunque falle', () => {
      const orig = localStorage.clear
      localStorage.clear = vi.fn(() => { throw new Error('quota') })
      expect(() => gateway.clear()).not.toThrow()
      localStorage.clear = orig
    })
  })
})
