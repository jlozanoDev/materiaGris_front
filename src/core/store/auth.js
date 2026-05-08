import { defineStore } from "pinia";
import { ref } from "vue";
import { provideAuthService } from "@/modules/auth/application/containers/authContainer";

export const useAuthStore = defineStore("auth", () => {
  const _storage = provideAuthService().storageGateway;

  const initialUser = (() => {
    try {
      const stored = _storage.get("user");
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  })();

  const user = ref(initialUser);

  async function fetchUser() {
    try {
      const authService = provideAuthService();
      const data = await authService.userRepository.me();
      user.value = data;
      _storage.set("user", JSON.stringify(data));
      return data;
    } catch (e) {
      user.value = null;
      _storage.remove("user");
      return null;
    }
  }

  function clearUser() {
    user.value = null;
    _storage.remove("user");
  }

  function hasPermission(slug) {
    if (!slug) return false;
    if (!user.value || !user.value.permissions) return false;

    const perms = user.value.permissions;

    // Object map: { 'admin.user.view': 1 }
    if (!Array.isArray(perms) && typeof perms === "object") {
      const val = perms[slug];
      return val === 1 || val === "1" || val === true;
    }

    // Array forms: [ 'admin.user.view', ... ] or [ { slug: 'admin.user.view' }, ... ]
    if (Array.isArray(perms)) {
      if (perms.includes(slug)) return true;
      return perms.some((p) => {
        if (!p) return false;
        if (typeof p === "string") return p === slug;
        if (typeof p === "object") return p.slug === slug || p.name === slug || p[slug] === 1;
        return false;
      });
    }

    // perms is neither object nor array - no permissions
    return false;
  }

  function hasPermissions(slugs = [], mode = "any") {
    if (!user.value || !user.value.permissions) return false;
    if (!Array.isArray(slugs)) slugs = [slugs];
    if (mode === "all") return slugs.every((s) => hasPermission(s));
    return slugs.some((s) => hasPermission(s));
  }

  return { user, fetchUser, clearUser, hasPermission, hasPermissions };
});
