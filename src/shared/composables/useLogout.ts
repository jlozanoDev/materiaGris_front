import { ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/shared/composables/useToast";
import { getAuthService } from "@/core/services/serviceRegistry";

export function useLogout(): { logout: () => Promise<void>; loading: Ref<boolean> } {
  const loading: Ref<boolean> = ref(false);
  const router = useRouter();
  const { show } = useToast();

  async function logout(): Promise<void> {
    if (loading.value) return;
    loading.value = true;
    try {
      await (getAuthService() as any).logout();
      show("Sesión cerrada", "success", 900);
      setTimeout(() => router.replace({ name: "Login" }), 900);
    } catch (_) {
      router.replace({ name: "Login" });
    } finally {
      loading.value = false;
    }
  }

  return { logout, loading };
}
