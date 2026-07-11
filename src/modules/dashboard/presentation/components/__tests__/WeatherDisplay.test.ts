import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeatherDisplay from '@/modules/dashboard/presentation/components/WeatherDisplay.vue';

describe('WeatherDisplay', () => {
  it('shows skeleton placeholder when empty (no data, no loading, no error)', () => {
    const wrapper = mount(WeatherDisplay, {
      props: { weatherData: null, loading: false, error: null },
    });

    // Skeleton shows animated pulse divs
    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
  });

  it('shows loading spinner when loading is true', () => {
    const wrapper = mount(WeatherDisplay, {
      props: { loading: true, weatherData: null, error: null },
    });

    expect(wrapper.find('.animate-spin').exists()).toBe(true);
  });

  it('shows error message when error is set', () => {
    const wrapper = mount(WeatherDisplay, {
      props: { error: 'No disponible', weatherData: null, loading: false },
    });

    expect(wrapper.text()).toContain('No disponible');
  });

  it('renders temperature, description and icon when weatherData is provided', () => {
    const weatherData = {
      temperature: 22,
      description: 'Soleado',
      wmoCode: 0,
      iconName: 'sunny',
    };

    const wrapper = mount(WeatherDisplay, {
      props: { weatherData, loading: false, error: null },
    });

    expect(wrapper.text()).toContain('22°C');
    expect(wrapper.text()).toContain('Soleado');
    // Sunny icon should be rendered (yellow circle)
    expect(wrapper.find('.text-yellow-300').exists()).toBe(true);
  });

  it('shows cloudy-sun icon for iconName "cloudy-sun"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 18, description: 'Nublado', wmoCode: 2, iconName: 'cloudy-sun' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('18°C');
    expect(wrapper.text()).toContain('Nublado');
  });

  it('shows foggy icon for iconName "foggy"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 10, description: 'Niebla', wmoCode: 45, iconName: 'foggy' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('10°C');
    expect(wrapper.text()).toContain('Niebla');
  });

  it('shows drizzle icon for iconName "drizzle"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 12, description: 'Llovizna', wmoCode: 51, iconName: 'drizzle' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('12°C');
    expect(wrapper.text()).toContain('Llovizna');
  });

  it('shows rainy icon for iconName "rainy"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 8, description: 'Lluvia', wmoCode: 61, iconName: 'rainy' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('8°C');
    expect(wrapper.text()).toContain('Lluvia');
  });

  it('shows snowy icon for iconName "snowy"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: -2, description: 'Nieve', wmoCode: 71, iconName: 'snowy' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('-2°C');
    expect(wrapper.text()).toContain('Nieve');
  });

  it('shows shower icon for iconName "shower"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 14, description: 'Chubascos', wmoCode: 80, iconName: 'shower' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('14°C');
    expect(wrapper.text()).toContain('Chubascos');
  });

  it('shows thunder icon for iconName "thunder"', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 20, description: 'Tormenta', wmoCode: 95, iconName: 'thunder' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('20°C');
    expect(wrapper.text()).toContain('Tormenta');
  });

  it('shows unknown/default icon for unknown iconName', () => {
    const wrapper = mount(WeatherDisplay, {
      props: {
        weatherData: { temperature: 25, description: 'Desconocido', wmoCode: 100, iconName: 'unknown' },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('25°C');
    expect(wrapper.text()).toContain('Desconocido');
  });
});
