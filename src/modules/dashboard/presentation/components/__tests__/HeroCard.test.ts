import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HeroCard from '@/modules/dashboard/presentation/components/HeroCard.vue';

describe('HeroCard with weather', () => {
  it('renders stats and weather data when provided', () => {
    const stats = { visits: 10, newPatients: 3, returningPatients: 7 };
    const weatherData = { temperature: 22, description: 'Soleado', wmoCode: 0, iconName: 'sunny' };

    const wrapper = mount(HeroCard, {
      props: {
        stats,
        loading: false,
        weatherData,
        weatherLoading: false,
        userName: 'Dr. Test',
      },
    });

    expect(wrapper.text()).toContain('Dr. Test');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('22°C');
    expect(wrapper.text()).toContain('Soleado');
  });

  it('shows loading skeleton when loading is true', () => {
    const wrapper = mount(HeroCard, {
      props: { loading: true },
    });

    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
  });

  it('shows weather error state when weatherError is set', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 5, newPatients: 2, returningPatients: 3 },
        weatherError: 'No disponible',
        weatherLoading: false,
      },
    });

    expect(wrapper.text()).toContain('No disponible');
  });

  it('shows CitySelector when showCitySelector is true', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 5, newPatients: 2, returningPatients: 3 },
        showCitySelector: true,
      },
    });

    expect(wrapper.text()).toContain('Permite ubicación para clima real');
  });

  it('renders different weather icon variants', () => {
    const weatherData = { temperature: 15, description: 'Lluvia', wmoCode: 61, iconName: 'rainy' };
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 1, newPatients: 0, returningPatients: 1 },
        weatherData,
        weatherLoading: false,
      },
    });

    expect(wrapper.text()).toContain('15°C');
    expect(wrapper.text()).toContain('Lluvia');
  });

  it('shows error badge when error prop is set', () => {
    const wrapper = mount(HeroCard, {
      props: { error: 'Error al cargar estadísticas' },
    });

    expect(wrapper.text()).toContain('Error al cargar estadísticas');
  });
});
