import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/core/store/auth";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "Dashboard", component: () => import("@/modules/dashboard/presentation/pages/DashboardPage.vue"), meta: { requiresAuth: true } },
  { path: "/admin/users", name: "AdminUsers", component: () => import("@/modules/admin/users/presentation/pages/UsersPage.vue"), meta: { requiresAuth: true } },
  { path: "/admin/roles", name: "AdminRoles", component: () => import("@/modules/admin/roles/presentation/pages/RolesPage.vue"), meta: { requiresAuth: true } },
  {
    path: "/admin/permissions",
    name: "AdminPermissions",
    component: () => import("@/modules/admin/permissions/presentation/pages/PermissionsPage.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/patients", name: "Patients", component: () => import("@/modules/patients/presentation/pages/PatientsPage.vue"), meta: { requiresAuth: true } },
  { path: "/login", name: "Login", component: () => import("@/modules/auth/presentation/pages/LoginView.vue") },
  { path: "/welcome", name: "Landing", component: () => import("@/modules/landing/presentation/pages/LandingPage.vue") },
  { path: "/aviso-legal", name: "LegalNotice", component: () => import("@/modules/landing/presentation/pages/LegalNoticePage.vue") },
  { path: "/privacidad", name: "Privacy", component: () => import("@/modules/landing/presentation/pages/PrivacyPage.vue") },
  { path: "/terminos", name: "Terms", component: () => import("@/modules/landing/presentation/pages/TermsPage.vue") },
  { path: "/forgot-password", name: "ForgotPassword", component: () => import("@/modules/auth/presentation/pages/ForgotPasswordPage.vue") },
  { path: "/reset-password", name: "ResetPassword", component: () => import("@/modules/auth/presentation/pages/ResetPasswordPage.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
});

router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  if (to.meta && to.meta.requiresAuth && !isAuthenticated) {
    if (to.path === "/") return next({ name: "Landing" });
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }
  if (to.name === "Login" && isAuthenticated) {
    return next({ name: "Dashboard" });
  }
  if (to.name === "Landing" && isAuthenticated) {
    return next({ name: "Dashboard" });
  }

  if (to.meta && to.meta.permissions) {
    const authStore = useAuthStore();
    if (!authStore.user) await authStore.fetchUser();

    const perms = to.meta.permissions as string | string[];
    const mode = ((to.meta.permissionsMode as string) || "any") as "any" | "all";
    const allowed = Array.isArray(perms)
      ? authStore.hasPermissions(perms, mode)
      : authStore.hasPermission(perms as string);
    if (!allowed) {
      return next({ name: "Dashboard" });
    }
  }

  return next();
});

export default router;
