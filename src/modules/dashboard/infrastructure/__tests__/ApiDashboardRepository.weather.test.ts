import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ApiDashboardRepository from '@/modules/dashboard/infrastructure/ApiDashboardRepository';

describe('ApiDashboardRepository — weather timeout (AbortController)', () => {
  let repo: ApiDashboardRepository;

  beforeEach(() => {
    repo = new ApiDashboardRepository();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('sets a 10s timeout via setTimeout when fetching weather', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    // Mock fetch to prevent actual network call
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          current: { temperature_2m: 20, weather_code: 0 },
        }),
    } as Response);

    await repo.getWeather(40.4168, -3.7038);

    // setTimeout should have been called with a 10000ms delay
    // It could be called multiple times (setup.js might call it),
    // so check that at least one call has 10000 as delay
    const callsWithDelay = setTimeoutSpy.mock.calls.filter(
      ([_fn, delay]) => delay === 10000
    );
    expect(callsWithDelay.length).toBeGreaterThanOrEqual(1);

    setTimeoutSpy.mockRestore();
  });

  it('clears the abort timeout when fetch succeeds', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          current: {
            temperature_2m: 22,
            weather_code: 0,
          },
        }),
    } as Response);

    const result = await repo.getWeather(40.4168, -3.7038);

    expect(result.temperature).toBe(22);
    expect(result.description).toBe('Despejado');
    expect(result.iconName).toBe('sunny');

    // clearTimeout should have been called to clean up
    expect(clearTimeoutSpy).toHaveBeenCalledOnce();

    // Advancing past 10s should NOT cause any issues (timeout was cleared)
    await expect(
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 10001);
        vi.advanceTimersByTime(10001);
      })
    ).resolves.not.toThrow();

    clearTimeoutSpy.mockRestore();
  });
});
