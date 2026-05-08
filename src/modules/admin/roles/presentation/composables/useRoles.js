import { ref } from "vue";
import {
  provideGetRolesUseCase,
  provideGetRoleUseCase,
  provideCreateRoleUseCase,
  provideUpdateRoleUseCase,
  provideDeleteRoleUseCase,
} from "@/modules/admin/roles/application/containers/rolesContainer";
import { provideGetAllPermissionsUseCase } from "@/modules/admin/permissions/application/containers/permissionsContainer";

export function useRoles() {
  const roles = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const availablePermissions = ref([]);

  const fetchRoles = async () => {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetRolesUseCase();
      const data = await useCase.execute();
      roles.value = data;
      return data;
    } catch (e) {
      console.error("[useRoles] fetchRoles error:", e);
      error.value = e;
      roles.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchRole = async (id) => {
    loading.value = true;
    try {
      const useCase = provideGetRoleUseCase();
      return await useCase.execute(id);
    } catch (e) {
      console.error("[useRoles] fetchRole error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createRole = async (payload) => {
    loading.value = true;
    try {
      const useCase = provideCreateRoleUseCase();
      const created = await useCase.execute(payload);
      await fetchRoles();
      return created;
    } catch (e) {
      console.error("[useRoles] createRole error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateRole = async (id, payload) => {
    loading.value = true;
    try {
      const useCase = provideUpdateRoleUseCase();
      const updated = await useCase.execute(id, payload);
      await fetchRoles();
      return updated;
    } catch (e) {
      console.error("[useRoles] updateRole error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteRole = async (id) => {
    loading.value = true;
    try {
      const useCase = provideDeleteRoleUseCase();
      const res = await useCase.execute(id);
      await fetchRoles();
      return res;
    } catch (e) {
      console.error("[useRoles] deleteRole error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const useCase = provideGetAllPermissionsUseCase();
      const data = await useCase.execute();
      availablePermissions.value = data;
      return data;
    } catch (e) {
      console.error("[useRoles] fetchAvailablePermissions error:", e);
      return [];
    }
  };

  return {
    roles,
    loading,
    error,
    availablePermissions,
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    fetchAvailablePermissions,
  };
}
