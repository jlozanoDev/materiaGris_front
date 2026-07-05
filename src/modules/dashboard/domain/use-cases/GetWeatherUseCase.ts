import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { WeatherData } from '@/modules/dashboard/domain/entities/WeatherData';
import type { GeolocationProvider } from '@/shared/providers/GeolocationProvider';

export default class GetWeatherUseCase {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly geolocationProvider: GeolocationProvider
  ) {}

  async execute(lat?: number, lon?: number): Promise<WeatherData> {
    if (lat === undefined || lon === undefined) {
      const position = await this.geolocationProvider.getCurrentPosition();
      lat = position.lat;
      lon = position.lon;
    }

    return this.dashboardRepository.getWeather(lat, lon);
  }
}
