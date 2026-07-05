import { describe, it, expect, vi, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import CitySelector from '@/modules/dashboard/presentation/components/CitySelector.vue';

describe('CitySelector', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function mockFetchOnce(data: unknown) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response);
  }

  it('shows "Ciudad no encontrada" when Nominatim returns empty results', async () => {
    vi.useFakeTimers();
    mockFetchOnce([]);

    const wrapper = mount(CitySelector);
    const input = wrapper.find('input');
    await input.setValue('Xyzzz123');

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    await nextTick();

    expect(wrapper.text()).toContain('Ciudad no encontrada');
  });

  it('emits city-selected on successful geocoding', async () => {
    vi.useFakeTimers();
    const mockResult = [
      { lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, Spain' },
    ];
    mockFetchOnce(mockResult);

    const wrapper = mount(CitySelector);
    const input = wrapper.find('input');
    await input.setValue('Madrid');

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    await nextTick();

    expect(wrapper.emitted('city-selected')).toHaveLength(1);
    expect(wrapper.emitted('city-selected')![0]).toEqual([
      { lat: 40.4168, lon: -3.7038, name: 'Madrid, Spain' },
    ]);
  });

  it('shows loading state during geocoding', async () => {
    vi.useFakeTimers();
    let resolveFetch: (value: unknown) => void;
    const fetchPromise = new Promise((r) => { resolveFetch = r; });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => fetchPromise,
    } as Response);

    const wrapper = mount(CitySelector);
    const input = wrapper.find('input');
    await input.setValue('Bogotá');

    vi.advanceTimersByTime(300);

    // After debounce, before fetch resolves, searching should be true
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.animate-spin').exists()).toBe(true);

    resolveFetch!([{ lat: '4.7110', lon: '-74.0721', display_name: 'Bogotá, Colombia' }]);
    await vi.runAllTimersAsync();

    expect(wrapper.find('.animate-spin').exists()).toBe(false);
  });

  it('form submit bypasses debounce and fetches the typed city', async () => {
    vi.useFakeTimers();
    const mockResult = [
      { lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, Spain' },
    ];
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const wrapper = mount(CitySelector);
    const input = wrapper.find('input');
    const form = wrapper.find('form');

    await input.setValue('Madrid');
    await form.trigger('submit');
    await vi.runAllTimersAsync();

    // onSubmit should trigger fetch immediately (no debounce)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('Madrid')
    );
  });
});
