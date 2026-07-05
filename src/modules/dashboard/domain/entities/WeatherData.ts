export interface WeatherData {
  temperature: number;   // °C
  description: string;   // Spanish, e.g. "Soleado"
  wmoCode: number;       // WMO weather code (0-99)
  iconName: string;      // e.g. "sunny", "cloudy", "rainy"
}
