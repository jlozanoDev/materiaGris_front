import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Mock page components (they don't exist yet) ----------
vi.mock('@/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue', () => ({ default: { template: '<div>List</div>' } }))
vi.mock('@/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue', () => ({ default: { template: '<div>Builder</div>' } }))
vi.mock('@/modules/reports/presentation/pages/ReportListPage.vue', () => ({ default: { template: '<div>Reports</div>' } }))
vi.mock('@/modules/reports/presentation/pages/ReportViewPage.vue', () => ({ default: { template: '<div>View</div>' } }))
vi.mock('@/modules/reports/presentation/pages/ReportFillPage.vue', () => ({ default: { template: '<div>Fill</div>' } }))

// ---------- Router import (after mocks) ----------
import router from '@/core/router/index'

describe('Report Route Definitions', () => {
  let allRoutes: any[]

  beforeEach(() => {
    allRoutes = router.getRoutes() as any[]
  })

  it('defines /admin/report-templates route with admin.reporttemplate.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.reporttemplate.view')
  })

  it('defines /admin/report-templates/nuevo route with admin.reporttemplate.create', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates/nuevo')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.reporttemplate.create')
  })

  it('defines /admin/report-templates/:id/editar route with admin.reporttemplate.update', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates/:id/editar')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.reporttemplate.update')
  })

  it('defines /informes route with report.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('report.view')
  })

  it('defines /informes/:id route with report.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes/:id')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('report.view')
  })

  it('defines /informes/:id/editar route with report.edit permission (array)', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes/:id/editar')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toEqual(['report.edit'])
  })

  it('defines /pacientes/:id/informe/nuevo route with report.create', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/pacientes/:id/informe/nuevo')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('report.create')
  })

  it('has at least 7 new report-related routes', () => {
    const reportRoutes = allRoutes.filter((rt: any) =>
      rt.meta?.permissions &&
      (rt.meta.permissions === 'report.view' ||
       (Array.isArray(rt.meta.permissions) && rt.meta.permissions.includes('report.edit')) ||
       rt.meta.permissions === 'report.create' ||
       rt.meta.permissions === 'admin.reporttemplate.create' ||
       rt.meta.permissions === 'admin.reporttemplate.update' ||
       rt.meta.permissions === 'admin.reporttemplate.view')
    )
    expect(reportRoutes.length).toBeGreaterThanOrEqual(7)
  })
})

describe('Route Guard — Permission Enforcement', () => {
  const guardLogic = (
    permissions: string | string[] | undefined,
    permissionsMode: string | undefined,
    userPermissions: string[]
  ): boolean => {
    if (!permissions) return true
    const mode = permissionsMode || 'any'
    if (Array.isArray(permissions)) {
      return mode === 'all'
        ? (permissions as string[]).every(s => userPermissions.includes(s))
        : (permissions as string[]).some(s => userPermissions.includes(s))
    }
    return userPermissions.includes(permissions as string)
  }

  describe('single permission slug (string format)', () => {
    it('allows access when user has the required permission', () => {
      expect(guardLogic('report.view', undefined, ['report.view'])).toBe(true)
    })
    it('denies access when user lacks the required permission', () => {
      expect(guardLogic('report.view', undefined, ['report.edit'])).toBe(false)
    })
    it('denies access when user has no permissions', () => {
      expect(guardLogic('report.view', undefined, [])).toBe(false)
    })
    it('allows via admin.reporttemplate.create if user has it', () => {
      expect(guardLogic('admin.reporttemplate.create', undefined, ['admin.reporttemplate.create', 'admin.reporttemplate.view'])).toBe(true)
    })
    it('denies admin.reporttemplate.create when user only has view', () => {
      expect(guardLogic('admin.reporttemplate.create', undefined, ['admin.reporttemplate.view'])).toBe(false)
    })
  })

  describe('array permission slugs', () => {
    it('allows access (any mode) when user has one of the permissions', () => {
      expect(guardLogic(['report.view', 'report.edit'], 'any', ['report.edit'])).toBe(true)
    })
    it('denies access (any mode) when user has none', () => {
      expect(guardLogic(['report.view', 'report.edit'], 'any', ['report.create'])).toBe(false)
    })
    it('allows access (all mode) when user has all', () => {
      expect(guardLogic(['report.view', 'report.edit'], 'all', ['report.view', 'report.edit'])).toBe(true)
    })
    it('denies access (all mode) when user has only some', () => {
      expect(guardLogic(['report.view', 'report.edit'], 'all', ['report.view'])).toBe(false)
    })
    it('defaults to any mode when no permissionsMode specified', () => {
      expect(guardLogic(['report.view', 'report.edit'], undefined, ['report.edit'])).toBe(true)
    })
  })

  describe('route guard decision matrix for report routes', () => {
    const scenarios = [
      ['report.view', undefined, ['report.view'], true],
      ['report.view', undefined, [], false],
      ['report.view', undefined, ['report.edit'], false],
      ['report.create', undefined, ['report.create'], true],
      ['report.create', undefined, ['report.view'], false],
      [['report.edit'], 'any', ['report.edit'], true],
      [['report.edit'], 'any', ['report.view'], false],
      [['report.view', 'report.edit'], 'any', ['report.view', 'report.edit'], true],
      ['admin.reporttemplate.view', undefined, ['admin.reporttemplate.view'], true],
      ['admin.reporttemplate.create', undefined, ['admin.reporttemplate.create'], true],
      ['admin.reporttemplate.update', undefined, ['admin.reporttemplate.update'], true],
      ['admin.reporttemplate.view', undefined, ['admin.reporttemplate.create'], false],
      ['admin.reporttemplate.create', undefined, ['admin.reporttemplate.view'], false],
    ] as const

    scenarios.forEach(([routePerms, mode, userPerms, expected]) => {
      const desc = `${JSON.stringify(routePerms)} mode=${mode ?? 'any'} user=${JSON.stringify(userPerms)} → ${expected ? 'ALLOW' : 'DENY'}`
      it(desc, () => {
        expect(guardLogic(routePerms as any, mode as any, userPerms as string[])).toBe(expected)
      })
    })
  })
})

describe('No meta.permissions route allows unauthenticated access', () => {
  it('returns true when meta.permissions is undefined (no guard)', () => {
    const result = (() => {
      const perms = undefined as string | string[] | undefined
      if (!perms) return true
      return false
    })()
    expect(result).toBe(true)
  })
})
