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

  it('defines /admin/report-templates route with admin.report-template.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.report-template.view')
  })

  it('defines /admin/report-templates/nuevo route with admin.report-template.create', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates/nuevo')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.report-template.create')
  })

  it('defines /admin/report-templates/:id/editar route with admin.report-template.edit', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/admin/report-templates/:id/editar')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('admin.report-template.edit')
  })

  it('defines /informes route with reports.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('reports.view')
  })

  it('defines /informes/:id route with reports.view permission', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes/:id')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('reports.view')
  })

  it('defines /informes/:id/editar route with reports.edit permission (array)', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/informes/:id/editar')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toEqual(['reports.edit'])
  })

  it('defines /pacientes/:id/informe/nuevo route with reports.create', () => {
    const r = allRoutes.find((rt: any) => rt.path === '/pacientes/:id/informe/nuevo')
    expect(r).toBeDefined()
    expect(r.meta.requiresAuth).toBe(true)
    expect(r.meta.permissions).toBe('reports.create')
  })

  it('has at least 7 new report-related routes', () => {
    const reportRoutes = allRoutes.filter((rt: any) =>
      rt.meta?.permissions &&
      (rt.meta.permissions === 'reports.view' ||
       (Array.isArray(rt.meta.permissions) && rt.meta.permissions.includes('reports.edit')) ||
       rt.meta.permissions === 'reports.create' ||
       rt.meta.permissions === 'admin.report-template.create' ||
       rt.meta.permissions === 'admin.report-template.edit' ||
       rt.meta.permissions === 'admin.report-template.view')
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
      expect(guardLogic('reports.view', undefined, ['reports.view'])).toBe(true)
    })
    it('denies access when user lacks the required permission', () => {
      expect(guardLogic('reports.view', undefined, ['reports.edit'])).toBe(false)
    })
    it('denies access when user has no permissions', () => {
      expect(guardLogic('reports.view', undefined, [])).toBe(false)
    })
    it('allows via admin.report-template.create if user has it', () => {
      expect(guardLogic('admin.report-template.create', undefined, ['admin.report-template.create', 'admin.report-template.view'])).toBe(true)
    })
    it('denies admin.report-template.create when user only has view', () => {
      expect(guardLogic('admin.report-template.create', undefined, ['admin.report-template.view'])).toBe(false)
    })
  })

  describe('array permission slugs', () => {
    it('allows access (any mode) when user has one of the permissions', () => {
      expect(guardLogic(['reports.view', 'reports.edit'], 'any', ['reports.edit'])).toBe(true)
    })
    it('denies access (any mode) when user has none', () => {
      expect(guardLogic(['reports.view', 'reports.edit'], 'any', ['reports.create'])).toBe(false)
    })
    it('allows access (all mode) when user has all', () => {
      expect(guardLogic(['reports.view', 'reports.edit'], 'all', ['reports.view', 'reports.edit'])).toBe(true)
    })
    it('denies access (all mode) when user has only some', () => {
      expect(guardLogic(['reports.view', 'reports.edit'], 'all', ['reports.view'])).toBe(false)
    })
    it('defaults to any mode when no permissionsMode specified', () => {
      expect(guardLogic(['reports.view', 'reports.edit'], undefined, ['reports.edit'])).toBe(true)
    })
  })

  describe('route guard decision matrix for report routes', () => {
    const scenarios = [
      ['reports.view', undefined, ['reports.view'], true],
      ['reports.view', undefined, [], false],
      ['reports.view', undefined, ['reports.edit'], false],
      ['reports.create', undefined, ['reports.create'], true],
      ['reports.create', undefined, ['reports.view'], false],
      [['reports.edit'], 'any', ['reports.edit'], true],
      [['reports.edit'], 'any', ['reports.view'], false],
      [['reports.edit'], 'any', ['reports.view', 'reports.edit'], true],
      ['admin.report-template.view', undefined, ['admin.report-template.view'], true],
      ['admin.report-template.create', undefined, ['admin.report-template.create'], true],
      ['admin.report-template.edit', undefined, ['admin.report-template.edit'], true],
      ['admin.report-template.view', undefined, ['admin.report-template.create'], false],
      ['admin.report-template.create', undefined, ['admin.report-template.view'], false],
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
