import { useAuthStore } from "@/core/store/auth";
import { watch } from "vue";

export default {
  mounted(el, binding) {
    const auth = useAuthStore();

    const updateVisibility = () => {
      const value = binding.value;
      if (!value) {
        // No permission specified = show element
        el.style.display = "";
        return;
      }

      const mode = binding.arg || "any";
      const allowed = Array.isArray(value)
        ? auth.hasPermissions(value, mode)
        : auth.hasPermission(value);

      if (allowed) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    };

    // Watch for auth changes to re-evaluate (especially useful after fetchUser)
    const unwatch = watch(() => [auth.user, binding.value], updateVisibility, {
      deep: true,
      immediate: true,
    });

    // Store unwatch to clean up
    el.__unwatch_permission__ = unwatch;
    // store current binding value so `updated` can detect changes to the binding object
    el.__v_has_permission_value__ = binding.value;
  },
  updated(el, binding) {
    // If Vue supplies a new binding object (binding.value replaced), the original
    // watcher captured the old binding and won't notice the new one. Detect that
    // case and recreate the watcher so it closes over the new `binding`.
    const prev = el.__v_has_permission_value__;
    const curr = binding.value;
    if (prev === curr) return;

    // teardown previous watch if any
    if (el.__unwatch_permission__) {
      try {
        el.__unwatch_permission__();
      } catch (e) {}
    }

    // recreate watcher bound to the new binding
    const auth = useAuthStore();
    const updateVisibility = () => {
      const value = binding.value;
      if (!value) return;

      const mode = binding.arg || "any";
      const allowed = Array.isArray(value)
        ? auth.hasPermissions(value, mode)
        : auth.hasPermission(value);
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
  unmounted(el) {
    if (el.__unwatch_permission__) {
      el.__unwatch_permission__();
    }
  },
};
