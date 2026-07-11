import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RightPanel from '@/modules/dashboard/presentation/components/RightPanel.vue'

describe('RightPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // May 30, 2026 (Friday) — matches task environment date
    vi.setSystemTime(new Date(2026, 4, 30))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Rendering ──────────────────────────────────────

  it('renders the calendar section heading', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.text()).toContain('Calendario')
  })

  it('renders current month name and year', () => {
    const wrapper = mount(RightPanel)
    // viewDate starts at May 1, 2026
    expect(wrapper.text()).toContain('mayo')
  })

  it('renders day-of-week labels (L M X J V S D)', () => {
    const wrapper = mount(RightPanel)
    const dowLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    dowLabels.forEach(label => {
      expect(wrapper.text()).toContain(label)
    })
  })


  it('renders "Lecturas diarias" section with multiple articles', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.text()).toContain('Lecturas diarias')
    expect(wrapper.text()).toContain('Educación médica equitativa')
    expect(wrapper.text()).toContain('Nuevos biomarcadores')
    expect(wrapper.text()).toContain('Protocolos actualizados')
    expect(wrapper.text()).toContain('medscape.com')
    expect(wrapper.text()).toContain('thelancet.com')
    expect(wrapper.text()).toContain('nih.gov')
  })

  // ── Computed: monthName ────────────────────────────

  it('monthName returns correct locale string', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.monthName).toBe('mayo')
  })

  it('monthName updates after navigating to previous month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('abril')
  })

  it('monthName updates after navigating to next month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.nextMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('junio')
  })

  // ── Computed: yearNum ──────────────────────────────

  it('yearNum returns current view year', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.yearNum).toBe(2026)
  })

  it('yearNum changes across year boundary (prev)', async () => {
    const wrapper = mount(RightPanel)
    // Navigate back to January 2026, then December 2025
    wrapper.vm.viewDate = new Date(2026, 0, 1)
    await wrapper.vm.$nextTick()
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('diciembre')
    expect(wrapper.vm.yearNum).toBe(2025)
  })

  it('yearNum changes across year boundary (next)', async () => {
    const wrapper = mount(RightPanel)
    // Navigate forward to December 2026, then January 2027
    wrapper.vm.viewDate = new Date(2026, 11, 1)
    await wrapper.vm.$nextTick()
    wrapper.vm.nextMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('enero')
    expect(wrapper.vm.yearNum).toBe(2027)
  })

  // ── Computed: calDays ──────────────────────────────

  it('calDays returns array with null padding for first-day offset', () => {
    const wrapper = mount(RightPanel)
    // May 1, 2026 is Friday → Monday-first shift = 4, so 4 nulls before day 1
    const days = wrapper.vm.calDays
    expect(days[0]).toBeNull()
    expect(days[1]).toBeNull()
    expect(days[2]).toBeNull()
    expect(days[3]).toBeNull()
    expect(days[4]).toBe(1)
    expect(days[5]).toBe(2)
  })

  it('calDays contains correct number of days in the month', () => {
    const wrapper = mount(RightPanel)
    const days = wrapper.vm.calDays
    // May has 31 days + 4 null padding = 35 cells
    expect(days.length).toBe(35)
    expect(days[days.length - 1]).toBe(31)
  })

  it('calDays handles month starting on Sunday (6 null padding with Monday-first)', async () => {
    const wrapper = mount(RightPanel)
    // March 1, 2026 is Sunday → getDay=0 → Monday-first shift = 6
    wrapper.vm.viewDate = new Date(2026, 2, 1)
    await wrapper.vm.$nextTick()
    const days = wrapper.vm.calDays
    expect(days[0]).toBeNull()
    expect(days[5]).toBeNull()
    expect(days[6]).toBe(1) // starts at column 6 (Sunday in Monday-first grid)
    expect(days[7]).toBe(2)
  })

  it('calDays updates when viewDate changes', async () => {
    const wrapper = mount(RightPanel)
    // February 2026: 28 days, Feb 1 is Sunday
    wrapper.vm.viewDate = new Date(2026, 1, 1)
    await wrapper.vm.$nextTick()
    const days = wrapper.vm.calDays
    expect(days[0]).toBeNull()
    expect(days[6]).toBe(1)
    // 2026 Feb has 28 days, starts Sunday → 6 nulls + 28 = 34 cells
    expect(days.length).toBe(34)
    expect(days[33]).toBe(28)
  })

  // ── Function: isToday ──────────────────────────────

  it('isToday returns true for today (May 30, 2026)', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.isToday(30)).toBe(true)
  })

  it('isToday returns false for null', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.isToday(null)).toBe(false)
  })

  it('isToday returns false for undefined', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.isToday(undefined)).toBe(false)
  })

  it('isToday returns false for different day in same month', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.isToday(15)).toBe(false)
  })

  it('isToday returns false when viewDate month differs from today', async () => {
    const wrapper = mount(RightPanel)
    // Navigate to April 2026 — today is still May 30
    wrapper.vm.viewDate = new Date(2026, 3, 1)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isToday(30)).toBe(false)
  })

  it('isToday returns false when viewDate year differs from today', async () => {
    const wrapper = mount(RightPanel)
    // Navigate to May 2025 — today is May 30, 2026
    wrapper.vm.viewDate = new Date(2025, 4, 1)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isToday(30)).toBe(false)
  })

  // ── Navigation ─────────────────────────────────────

  it('prevMonth decrements the month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.viewDate.getMonth()).toBe(3) // April (0-indexed)
  })

  it('nextMonth increments the month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.nextMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.viewDate.getMonth()).toBe(5) // June (0-indexed)
  })

  it('prevMonth button triggers prevMonth when clicked', async () => {
    const wrapper = mount(RightPanel)
    const buttons = wrapper.findAll('button')
    const prevBtn = buttons[0]
    await prevBtn.trigger('click')
    expect(wrapper.vm.viewDate.getMonth()).toBe(3) // April
  })

  it('nextMonth button triggers nextMonth when clicked', async () => {
    const wrapper = mount(RightPanel)
    const buttons = wrapper.findAll('button')
    const nextBtn = buttons[1]
    await nextBtn.trigger('click')
    expect(wrapper.vm.viewDate.getMonth()).toBe(5) // June
  })

  // ── Template: today highlighting ───────────────────

  it('today cell has indigo background style', () => {
    const wrapper = mount(RightPanel)
    // Component uses :style="isToday(day) ? { background: '#7c3aed', ... }"
    const todaySpan = wrapper.findAll('span').filter(s => s.text() === '30')[0]
    expect(todaySpan).toBeDefined()
    expect(todaySpan.attributes('style')).toContain('rgb(124, 58, 237)')
  })

  // ── Template: calendar grid rendering ──────────────

  it('renders null-padding cells as empty divs without span', () => {
    const wrapper = mount(RightPanel)
    // The calendar grid has divs with class "flex flex-col..."
    // Get the 4th cell (index 3) which should be null padding
    const gridContainer = wrapper.find('.grid.grid-cols-7.text-center.gap-y-0\\.5')
    expect(gridContainer.exists()).toBe(true)

    // The first 4 div children should not have a span (null days)
    const dayDivs = gridContainer.findAll(':scope > div')
    expect(dayDivs.length).toBe(35) // 4 null + 31 days

    // null cells: no span inside (just empty div)
    for (let i = 0; i < 4; i++) {
      const span = dayDivs[i].find('span')
      expect(span.exists()).toBe(false)
    }
    // day 1 cell: has span
    expect(dayDivs[4].find('span').exists()).toBe(true)
  })

  it('displays month name and year in template after navigation', async () => {
    const wrapper = mount(RightPanel)
    // Initial: May 2026
    const monthText = wrapper.findAll('p').filter(p => p.text() === 'mayo 2026')[0]
    expect(monthText).toBeDefined()

    // Navigate to previous
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    const monthText2 = wrapper.findAll('p').filter(p => p.text() === 'abril 2026')[0]
    expect(monthText2).toBeDefined()
  })
})
