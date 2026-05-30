import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { getStorageGateway, getAuthService } from "@/core/services/serviceRegistry";
import type { AuthUser, PermissionFormat } from "@/shared/types";

export const useAuthStore = defineStore("auth", () => {
  const _storage = getStorageGateway();

  const initialUser = ((): AuthUser | null => {
    try {
      const stored = _storage.get("user");
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch {
      return null;
    }
  })();

  const user: Ref<AuthUser | null> = ref(initialUser);

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      const data = await getAuthService().userRepository.me();
      user.value = data;
      _storage.set("user", JSON.stringify(data));
      return data;
    } catch {
      user.value = null;
      _storage.remove("user");
      return null;
    }
  }

  function clearUser(): void {
    user.value = null;
    _storage.remove("user");
  }

  function hasPermission(slug: string): boolean {
    if (!slug) return false;
    if (!user.value || !user.value.permissions) return false;

    const perms = user.value.permissions;

    // Object map: { 'admin.user.view': 1 }
    if (!Array.isArray(perms) && typeof perms === "object") {
      const val = (perms as Record<string, unknown>)[slug];
      return val === 1 || val === "1" || val === true;
    }

    // Array forms
    if (Array.isArray(perms)) {
      if ((perms as unknown[]).includes(slug)) return true;
      return perms.some((p: unknown) => {
        if (!p) return false;
        if (typeof p === "string") return p === slug;
        if (typeof p === "object" && p !== null) {
          const obj = p as Record<string, unknown>;
          return obj.slug === slug || obj.name === slug || obj[slug] === 1;
        }
        return false;
      });
    }

    return false;
  }

  function hasPermissions(slugs: string[] = [], mode: "any" | "all" = "any"): boolean {
    if (!user.value || !user.value.permissions) return false;
    if (mode === "all") return slugs.every((s) => hasPermission(s));
    return slugs.some((s) => hasPermission(s));
  }

  return { user, fetchUser, clearUser, hasPermission, hasPermissions };
});
