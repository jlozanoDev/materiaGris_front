import { ref, type Ref } from "vue";
import { provideGetAllPermissionsUseCase } from "@/modules/admin/permissions/application/containers/permissionsContainer";
import type { PermissionShape } from "@/shared/types";

export interface UsePermissionsReturn {
  permissions: Ref<PermissionShape[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchPermissions: () => Promise<PermissionShape[] | null>;
}

export function usePermissions(): UsePermissionsReturn {
  const permissions: Ref<PermissionShape[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  const fetchPermissions = async (): Promise<PermissionShape[] | null> => {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetAllPermissionsUseCase();
      const data = await useCase.execute();
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
