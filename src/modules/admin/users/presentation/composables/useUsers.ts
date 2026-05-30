import { ref, type Ref } from "vue";
import {
  provideGetAllUsersUseCase,
  provideCreateUserUseCase,
  provideUpdateUserUseCase,
  provideDeleteUserUseCase,
} from "@/modules/admin/users/application/containers/usersContainer";
import type { AdminUser } from "@/shared/types";

export interface UseUsersReturn {
  users: Ref<AdminUser[]>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  fetchUsers: () => Promise<AdminUser[] | null>;
  createUser: (payload: Record<string, unknown>) => Promise<any>;
  updateUser: (id: number | string, payload: Record<string, unknown>) => Promise<any>;
  deleteUser: (id: number | string) => Promise<any>;
}

export function useUsers(): UseUsersReturn {
  const users: Ref<AdminUser[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  const fetchUsers = async (): Promise<AdminUser[] | null> => {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideGetAllUsersUseCase();
      const data = await useCase.execute();
      users.value = data;
      return data;
    } catch (e) {
      console.error("[useUsers] fetchUsers error:", e);
      error.value = e;
      users.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (payload: Record<string, unknown>): Promise<any> => {
    loading.value = true;
    try {
      const useCase = provideCreateUserUseCase();
      const created = await useCase.execute(payload);
      await fetchUsers();
      return created;
    } catch (e) {
      console.error("[useUsers] createUser error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number | string, payload: Record<string, unknown>): Promise<any> => {
    loading.value = true;
    try {
      const useCase = provideUpdateUserUseCase();
      const updated = await useCase.execute(id, payload);
      await fetchUsers();
      return updated;
    } catch (e) {
      console.error("[useUsers] updateUser error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: number | string): Promise<any> => {
    loading.value = true;
    try {
      const useCase = provideDeleteUserUseCase();
      const res = await useCase.execute(id);
      await fetchUsers();
      return res;
    } catch (e) {
      console.error("[useUsers] deleteUser error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
}
