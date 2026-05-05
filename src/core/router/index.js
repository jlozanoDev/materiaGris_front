import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/store/auth'
import DashboardPage from '@/modules/dashboard/presentation/pages/DashboardPage.vue'
import LoginView from '@/modules/auth/presentation/pages/LoginView.vue'
import ForgotPasswordPage from '@/modules/auth/presentation/pages/ForgotPasswordPage.vue'
import ResetPasswordPage from '@/modules/auth/presentation/pages/ResetPasswordPage.vue'
import UsersPage from '@/modules/admin/users/presentation/pages/UsersPage.vue'
import RolesPage from '@/modules/admin/roles/presentation/pages/RolesPage.vue'
import PermissionsPage from '@/modules/admin/permissions/presentation/pages/PermissionsPage.vue'
import PatientsPage from '@/modules/patients/presentation/pages/PatientsPage.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'AdminUsers', component: UsersPage, meta: { requiresAuth: true } },
  { path: '/admin/roles', name: 'AdminRoles', component: RolesPage, meta: { requiresAuth: true } },
  { path: '/admin/permissions', name: 'AdminPermissions', component: PermissionsPage, meta: { requiresAuth: true } },
  { path: '/patients', name: 'Patients', component: PatientsPage, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordPage },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Global navigation guard: redirect to login if route requires auth and no token
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')
  if (to.meta && to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.name === 'Login' && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Frontend authorization checks (UX-level). Backend will enforce the real check.
  if (to.meta && to.meta.permissions) {
    const authStore = useAuthStore()
    if (!authStore.user) await authStore.fetchUser()

    const perms = to.meta.permissions
    const mode = to.meta.permissionsMode || 'any'
    const allowed = Array.isArray(perms) ? authStore.hasPermissions(perms, mode) : authStore.hasPermission(perms)
    if (!allowed) {
      return next({ name: 'Dashboard' })
    }
  }

  return next()
})

export default router
