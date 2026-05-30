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
    expect(wrapper.text()).toContain('May 2026')
  })

  it('renders day-of-week labels (D L M X J V S)', () => {
    const wrapper = mount(RightPanel)
    const dowLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    dowLabels.forEach(label => {
      expect(wrapper.text()).toContain(label)
    })
  })

  it('renders "Próximos" section', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.text()).toContain('Próximos')
    expect(wrapper.text()).toContain('Ver todo')
    expect(wrapper.text()).toContain('Reunión mensual de doctores')
  })

  it('renders "Lectura diaria" card', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.text()).toContain('Lectura diaria')
    expect(wrapper.text()).toContain('Educación médica equitativa')
    expect(wrapper.text()).toContain('medscape.com')
  })

  // ── Computed: monthName ────────────────────────────

  it('monthName returns correct locale string', () => {
    const wrapper = mount(RightPanel)
    expect(wrapper.vm.monthName).toBe('May')
  })

  it('monthName updates after navigating to previous month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('April')
  })

  it('monthName updates after navigating to next month', async () => {
    const wrapper = mount(RightPanel)
    wrapper.vm.nextMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('June')
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
    expect(wrapper.vm.monthName).toBe('December')
    expect(wrapper.vm.yearNum).toBe(2025)
  })

  it('yearNum changes across year boundary (next)', async () => {
    const wrapper = mount(RightPanel)
    // Navigate forward to December 2026, then January 2027
    wrapper.vm.viewDate = new Date(2026, 11, 1)
    await wrapper.vm.$nextTick()
    wrapper.vm.nextMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.monthName).toBe('January')
    expect(wrapper.vm.yearNum).toBe(2027)
  })

  // ── Computed: calDays ──────────────────────────────

  it('calDays returns array with null padding for first-day offset', () => {
    const wrapper = mount(RightPanel)
    // May 1, 2026 is Friday → firstDow = 5, so 5 nulls before day 1
    const days = wrapper.vm.calDays
    expect(days[0]).toBeNull()
    expect(days[1]).toBeNull()
    expect(days[2]).toBeNull()
    expect(days[3]).toBeNull()
    expect(days[4]).toBeNull()
    expect(days[5]).toBe(1)
    expect(days[6]).toBe(2)
  })

  it('calDays contains correct number of days in the month', () => {
    const wrapper = mount(RightPanel)
    const days = wrapper.vm.calDays
    // May has 31 days + 5 null padding = 36 cells
    expect(days.length).toBe(36)
    expect(days[days.length - 1]).toBe(31)
  })

  it('calDays handles month starting on Sunday (no null padding)', async () => {
    const wrapper = mount(RightPanel)
    // March 1, 2026 is Sunday → firstDow = 0
    wrapper.vm.viewDate = new Date(2026, 2, 1)
    await wrapper.vm.$nextTick()
    const days = wrapper.vm.calDays
    expect(days[0]).toBe(1) // starts immediately with 1
    expect(days[1]).toBe(2)
  })

  it('calDays updates when viewDate changes', async () => {
    const wrapper = mount(RightPanel)
    // February 2026: 28 days, Feb 1 is Sunday
    wrapper.vm.viewDate = new Date(2026, 1, 1)
    await wrapper.vm.$nextTick()
    const days = wrapper.vm.calDays
    expect(days[0]).toBe(1)
    // 2026 Feb has 28 days, starts Sunday → 28 cells
    expect(days.length).toBe(28)
    expect(days[27]).toBe(28)
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

  it('today cell has indigo background class (bg-indigo-600)', () => {
    const wrapper = mount(RightPanel)
    const todayCell = wrapper.find('.bg-indigo-600')
    expect(todayCell.exists()).toBe(true)
    expect(todayCell.text()).toBe('30')
  })

  it('today cell does not show appointment dot', () => {
    const wrapper = mount(RightPanel)
    // Today (30) is not in dotDays [1,8,14,21], so no red dot
    const todayCell = wrapper.find('.bg-indigo-600')
    const dot = todayCell.find('.bg-red-500')
    expect(dot.exists()).toBe(false)
  })

  // ── Template: appointment dots ─────────────────────

  it('shows red dot on appointment days (1, 8, 14, 21)', () => {
    const wrapper = mount(RightPanel)
    // dotDays = [1, 8, 14, 21]
    // Navigate to a month where these aren't today
    // May 2026: today is 30, not in dotDays
    const dots = wrapper.findAll('.bg-red-500')
    expect(dots.length).toBe(4) // exactly 4 dots
  })

  it('dot is not shown on today even if today is a dot day', async () => {
    // Set system time to May 1, 2026 (which IS in dotDays)
    vi.setSystemTime(new Date(2026, 4, 1))
    const wrapper = mount(RightPanel)

    // Now today = May 1, viewDate = May 2026
    // day 1 → isToday(1) = true → dotDays.has(1) && !isToday(1) = false
    // So the dot should NOT appear on day 1
    const todayCell = wrapper.find('.bg-indigo-600')
    expect(todayCell.exists()).toBe(true)
    expect(todayCell.text()).toBe('1')
    const dot = todayCell.find('.bg-red-500')
    expect(dot.exists()).toBe(false)
  })

  // ── Template: calendar grid rendering ──────────────

  it('renders null-padding cells as empty divs without span', () => {
    const wrapper = mount(RightPanel)
    // The calendar grid has divs with class "flex flex-col..."
    // Get the 5th cell (index 4) which should be null padding
    const gridContainer = wrapper.find('.grid.grid-cols-7.text-center.gap-y-0\\.5')
    expect(gridContainer.exists()).toBe(true)

    // The first 5 div children should not have a span (null days)
    const allCells = gridContainer.findAll('div')
    // Filter to only direct children of the grid
    const dayDivs = gridContainer.findAll(':scope > div')
    expect(dayDivs.length).toBe(36) // 5 null + 31 days

    // null cells: no span inside (just empty div)
    for (let i = 0; i < 5; i++) {
      const span = dayDivs[i].find('span')
      expect(span.exists()).toBe(false)
    }
    // day 1 cell: has span
    expect(dayDivs[5].find('span').exists()).toBe(true)
  })

  it('displays month name and year in template after navigation', async () => {
    const wrapper = mount(RightPanel)
    // Initial: May 2026
    expect(wrapper.find('p.text-xs.text-slate-500').text()).toBe('May 2026')

    // Navigate to previous
    wrapper.vm.prevMonth()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('p.text-xs.text-slate-500').text()).toBe('April 2026')
  })
})
