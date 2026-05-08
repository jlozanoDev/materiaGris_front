import { ref } from "vue";
import { provideGetAllPermissionsUseCase } from "@/modules/admin/permissions/application/containers/permissionsContainer";

export function usePermissions() {
  const permissions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPermissions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetAllPermissionsUseCase();
      const data = await useCase.execute();
      console.log("[usePermissions] Fetched data:", data);
      permissions.value = data;
      return data;
    } catch (e) {
      console.error("[usePermissions] fetchPermissions error:", e);
      error.value = e;
      permissions.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { permissions, loading, error, fetchPermissions };
}
