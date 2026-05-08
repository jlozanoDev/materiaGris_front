import { ref } from "vue";
import { provideGetAllUsersUseCase } from "@/modules/admin/users/application/containers/usersContainer";
import {
  provideCreateUserUseCase,
  provideUpdateUserUseCase,
  provideDeleteUserUseCase,
} from "@/modules/admin/users/application/containers/usersContainer";

export function useUsers() {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async () => {
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

  const createUser = async (payload) => {
    loading.value = true;
    try {
      const useCase = provideCreateUserUseCase();
      const created = await useCase.execute(payload);
      // refresh list
      await fetchUsers();
      return created;
    } catch (e) {
      console.error("[useUsers] createUser error:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id, payload) => {
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

  const deleteUser = async (id) => {
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
