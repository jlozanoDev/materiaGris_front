import { useAuthStore } from "@/core/store/auth";
import { watch, type Directive, type DirectiveBinding } from "vue";

interface PermissionDirectiveElement extends HTMLElement {
  __unwatch_permission__?: () => void;
  __v_has_permission_value__?: unknown;
}

const permissionDirective: Directive<PermissionDirectiveElement> = {
  mounted(el: PermissionDirectiveElement, binding: DirectiveBinding) {
    const auth = useAuthStore();

    const updateVisibility = () => {
      const value = binding.value;
      if (!value) {
        el.style.display = "";
        return;
      }

      const mode = ((binding.arg as string) || "any") as "any" | "all";
      const allowed = Array.isArray(value)
        ? auth.hasPermissions(value, mode)
        : auth.hasPermission(value as string);

      if (allowed) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    };

    const unwatch = watch(() => [auth.user, binding.value], updateVisibility, {
      deep: true,
      immediate: true,
    });

    el.__unwatch_permission__ = unwatch;
    el.__v_has_permission_value__ = binding.value;
  },

  updated(el: PermissionDirectiveElement, binding: DirectiveBinding) {
    const prev = el.__v_has_permission_value__;
    const curr = binding.value;
    if (prev === curr) return;

    if (el.__unwatch_permission__) {
      try {
        el.__unwatch_permission__();
      } catch (_e) {
        /* noop */
      }
    }

    const auth = useAuthStore();
    const updateVisibility = () => {
      const value = binding.value;
      if (!value) {
        el.style.display = "";
        return;
      }

      const mode = ((binding.arg as string) || "any") as "any" | "all";
      const allowed = Array.isArray(value)
        ? auth.hasPermissions(value, mode)
        : auth.hasPermission(value as string);
      if (allowed) el.style.display = "";
      else el.style.display = "none";
    };

    const unwatch = watch(() => [auth.user, binding.value], updateVisibility, {
      deep: true,
      immediate: true,
    });

    el.__unwatch_permission__ = unwatch;
    el.__v_has_permission_value__ = curr;
  },

  unmounted(el: PermissionDirectiveElement) {
    if (el.__unwatch_permission__) {
      el.__unwatch_permission__();
    }
  },
};

export default permissionDirective;
