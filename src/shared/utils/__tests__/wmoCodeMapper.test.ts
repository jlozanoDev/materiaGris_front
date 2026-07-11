import { describe, it, expect } from 'vitest';
import { wmoCodeMapper } from '@/shared/utils/wmoCodeMapper';

describe('wmoCodeMapper', () => {
  it('maps code 0 to "Despejado" with icon "sunny"', () => {
    const result = wmoCodeMapper(0);
    expect(result.description).toBe('Despejado');
    expect(result.iconName).toBe('sunny');
  });

  it('maps code 1 to "Parcialmente nublado" with icon "cloudy-sun"', () => {
    const result = wmoCodeMapper(1);
    expect(result.description).toBe('Parcialmente nublado');
    expect(result.iconName).toBe('cloudy-sun');
  });

  it('maps code 2 to "Parcialmente nublado" with icon "cloudy-sun"', () => {
    const result = wmoCodeMapper(2);
    expect(result.description).toBe('Parcialmente nublado');
    expect(result.iconName).toBe('cloudy-sun');
  });

  it('maps code 3 to "Parcialmente nublado" with icon "cloudy-sun"', () => {
    const result = wmoCodeMapper(3);
    expect(result.description).toBe('Parcialmente nublado');
    expect(result.iconName).toBe('cloudy-sun');
  });

  it('maps code 45 to "Niebla" with icon "foggy"', () => {
    const result = wmoCodeMapper(45);
    expect(result.description).toBe('Niebla');
    expect(result.iconName).toBe('foggy');
  });

  it('maps code 48 to "Niebla" with icon "foggy"', () => {
    const result = wmoCodeMapper(48);
    expect(result.description).toBe('Niebla');
    expect(result.iconName).toBe('foggy');
  });

  it('maps code 51 to "Llovizna" with icon "drizzle"', () => {
    const result = wmoCodeMapper(51);
    expect(result.description).toBe('Llovizna');
    expect(result.iconName).toBe('drizzle');
  });

  it('maps code 55 to "Llovizna" with icon "drizzle"', () => {
    const result = wmoCodeMapper(55);
    expect(result.description).toBe('Llovizna');
    expect(result.iconName).toBe('drizzle');
  });

  it('maps code 61 to "Lluvia" with icon "rainy"', () => {
    const result = wmoCodeMapper(61);
    expect(result.description).toBe('Lluvia');
    expect(result.iconName).toBe('rainy');
  });

  it('maps code 65 to "Lluvia" with icon "rainy"', () => {
    const result = wmoCodeMapper(65);
    expect(result.description).toBe('Lluvia');
    expect(result.iconName).toBe('rainy');
  });

  it('maps code 71 to "Nieve" with icon "snowy"', () => {
    const result = wmoCodeMapper(71);
    expect(result.description).toBe('Nieve');
    expect(result.iconName).toBe('snowy');
  });

  it('maps code 77 to "Nieve" with icon "snowy"', () => {
    const result = wmoCodeMapper(77);
    expect(result.description).toBe('Nieve');
    expect(result.iconName).toBe('snowy');
  });

  it('maps code 80 to "Chubascos" with icon "shower"', () => {
    const result = wmoCodeMapper(80);
    expect(result.description).toBe('Chubascos');
    expect(result.iconName).toBe('shower');
  });

  it('maps code 82 to "Chubascos" with icon "shower"', () => {
    const result = wmoCodeMapper(82);
    expect(result.description).toBe('Chubascos');
    expect(result.iconName).toBe('shower');
  });

  it('maps code 95 to "Tormenta" with icon "thunder"', () => {
    const result = wmoCodeMapper(95);
    expect(result.description).toBe('Tormenta');
    expect(result.iconName).toBe('thunder');
  });

  it('maps code 99 to "Tormenta" with icon "thunder"', () => {
    const result = wmoCodeMapper(99);
    expect(result.description).toBe('Tormenta');
    expect(result.iconName).toBe('thunder');
  });

  it('returns default "Desconocido" for unknown codes', () => {
    const result = wmoCodeMapper(100);
    expect(result.description).toBe('Desconocido');
    expect(result.iconName).toBe('unknown');
  });

  it('returns default "Desconocido" for code -1', () => {
    const result = wmoCodeMapper(-1);
    expect(result.description).toBe('Desconocido');
    expect(result.iconName).toBe('unknown');
  });
});
