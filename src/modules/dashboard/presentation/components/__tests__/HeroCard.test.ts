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

  it('renders new-professional onboarding tips when isEmptyState && isNewProfessional', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 },
        loading: false,
        isEmptyState: true,
        isNewProfessional: true,
      },
    });

    expect(wrapper.text()).toContain('Comienza a construir');
    expect(wrapper.text()).toContain('Registra tu primer paciente');
    expect(wrapper.text()).toContain('Crea una plantilla');
    // Zero stat cards should NOT render
    expect(wrapper.text()).not.toContain('Visitas hoy');
  });

  it('renders slow-day variant when isEmptyState && !isNewProfessional', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 12 },
        loading: false,
        isEmptyState: true,
        isNewProfessional: false,
      },
    });

    expect(wrapper.text()).toContain('Hoy no hay actividad');
    expect(wrapper.text()).toContain('12');
    // Zero stat cards should NOT render
    expect(wrapper.text()).not.toContain('Visitas hoy');
  });

  it('renders stats normally when isEmptyState is false', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 10, newPatients: 3, returningPatients: 7, totalPatients: 100 },
        loading: false,
        isEmptyState: false,
        isNewProfessional: false,
      },
    });

    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('Visitas hoy');
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('7');
  });

  it('renders stats when isEmptyState and isNewProfessional props are omitted (backward compat)', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 5, newPatients: 2, returningPatients: 3, totalPatients: 50 },
        loading: false,
      },
    });

    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('Visitas hoy');
  });
});
