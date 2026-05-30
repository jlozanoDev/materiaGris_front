import { ref, type Ref } from "vue";
import {
  provideGetRolesUseCase,
  provideGetRoleUseCase,
  provideCreateRoleUseCase,
  provideUpdateRoleUseCase,
  provideDeleteRoleUseCase,
} from "@/modules/admin/roles/application/containers/rolesContainer";
import type { Role, PermissionShape } from "@/shared/types";

export interface UseRolesReturn {
  roles: Ref<Role[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  availablePermissions: Ref<PermissionShape[]>;
  fetchRoles: () => Promise<Role[] | null>;
  fetchRole: (id: number | string) => Promise<any>;
  createRole: (payload: Record<string, unknown>) => Promise<any>;
  updateRole: (id: number | string, payload: Record<string, unknown>) => Promise<any>;
  deleteRole: (id: number | string) => Promise<any>;
  fetchAvailablePermissions: () => Promise<PermissionShape[]>;
}

export function useRoles(fetchPermissionsFn?: () => Promise<any>): UseRolesReturn {
  const roles: Ref<Role[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);
  const availablePermissions: Ref<PermissionShape[]> = ref([]);

  const fetchRoles = async (): Promise<Role[] | null> => {
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

  const fetchRole = async (id: number | string): Promise<any> => {
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

  const createRole = async (payload: Record<string, unknown>): Promise<any> => {
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

  const updateRole = async (id: number | string, payload: Record<string, unknown>): Promise<any> => {
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

  const deleteRole = async (id: number | string): Promise<any> => {
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

  const fetchAvailablePermissions = async (): Promise<PermissionShape[]> => {
    if (!fetchPermissionsFn) return [];
    try {
      const data = await fetchPermissionsFn();
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
