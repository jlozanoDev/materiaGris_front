export interface WmoCodeResult {
  description: string;
  iconName: string;
}

const WMO_MAP: Array<{ min: number; max: number; description: string; iconName: string }> = [
  { min: 0, max: 0, description: 'Despejado', iconName: 'sunny' },
  { min: 1, max: 3, description: 'Parcialmente nublado', iconName: 'cloudy-sun' },
  { min: 45, max: 48, description: 'Niebla', iconName: 'foggy' },
  { min: 51, max: 55, description: 'Llovizna', iconName: 'drizzle' },
  { min: 61, max: 65, description: 'Lluvia', iconName: 'rainy' },
  { min: 71, max: 77, description: 'Nieve', iconName: 'snowy' },
  { min: 80, max: 82, description: 'Chubascos', iconName: 'shower' },
  { min: 95, max: 99, description: 'Tormenta', iconName: 'thunder' },
];

export function wmoCodeMapper(code: number): WmoCodeResult {
  const match = WMO_MAP.find((entry) => code >= entry.min && code <= entry.max);
  return match ?? { description: 'Desconocido', iconName: 'unknown' };
}
