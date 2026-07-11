import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetWeatherUseCase from '@/modules/dashboard/domain/use-cases/GetWeatherUseCase';
import type { DashboardRepository } from '@/modules/dashboard/domain/repositories/DashboardRepository';
import type { GeolocationProvider } from '@/shared/providers/GeolocationProvider';
import { MockGeolocationProvider } from '@/shared/providers/GeolocationProvider';

function createMockRepo(): DashboardRepository {
  return {
    getStats: vi.fn(),
    getRecentPatients: vi.fn(),
    getPendingReports: vi.fn(),
    getSystemMetrics: vi.fn(),
    getPatientsCount: vi.fn(),
    getTemplatesCount: vi.fn(),
    getReportsByStatus: vi.fn(),
    getWeather: vi.fn(),
  };
}

describe('GetWeatherUseCase', () => {
  let repo: DashboardRepository;
  let geoProvider: GeolocationProvider;
  let useCase: GetWeatherUseCase;

  beforeEach(() => {
    repo = createMockRepo();
  });

  it('delegates to repo.getWeather with provided coordinates', async () => {
    geoProvider = new MockGeolocationProvider();
    useCase = new GetWeatherUseCase(repo, geoProvider);

    const mockWeather = { temperature: 22, description: 'Soleado', wmoCode: 0, iconName: 'sunny' };
    (repo.getWeather as any).mockResolvedValue(mockWeather);

    const result = await useCase.execute(40.4168, -3.7038);

    expect(repo.getWeather).toHaveBeenCalledWith(40.4168, -3.7038);
    expect(result).toEqual(mockWeather);
  });

  it('uses geolocation provider when no coordinates given', async () => {
    geoProvider = new MockGeolocationProvider(41.3851, 2.1734);
    useCase = new GetWeatherUseCase(repo, geoProvider);

    const mockWeather = { temperature: 18, description: 'Nublado', wmoCode: 2, iconName: 'cloudy-sun' };
    (repo.getWeather as any).mockResolvedValue(mockWeather);

    const result = await useCase.execute();

    expect(repo.getWeather).toHaveBeenCalledWith(41.3851, 2.1734);
    expect(result).toEqual(mockWeather);
  });

  it('propagates geolocation rejection error', async () => {
    geoProvider = new MockGeolocationProvider(0, 0, true);
    useCase = new GetWeatherUseCase(repo, geoProvider);

    await expect(useCase.execute()).rejects.toThrow('Geolocation denied');
  });

  it('propagates API errors from repository', async () => {
    geoProvider = new MockGeolocationProvider();
    useCase = new GetWeatherUseCase(repo, geoProvider);

    (repo.getWeather as any).mockRejectedValue(new Error('API error'));

    await expect(useCase.execute(40.4168, -3.7038)).rejects.toThrow('API error');
  });

  it('calls repo.getWeather with the coordinates from geolocation', async () => {
    geoProvider = new MockGeolocationProvider(40.4168, -3.7038);
    useCase = new GetWeatherUseCase(repo, geoProvider);

    const mockWeather = { temperature: 25, description: 'Despejado', wmoCode: 0, iconName: 'sunny' };
    (repo.getWeather as any).mockResolvedValue(mockWeather);

    const result = await useCase.execute();

    expect(repo.getWeather).toHaveBeenCalledWith(40.4168, -3.7038);
    expect(result.temperature).toBe(25);
    expect(result.description).toBe('Despejado');
    expect(result.iconName).toBe('sunny');
  });
});
