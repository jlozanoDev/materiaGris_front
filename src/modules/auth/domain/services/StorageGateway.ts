import type { IStorageGateway } from "@/shared/types";

export default class StorageGateway implements IStorageGateway {
  get(_key: string): string | null {
    throw new Error("Not implemented");
  }

  set(_key: string, _value: string): void {
    throw new Error("Not implemented");
  }

  remove(_key: string): void {
    throw new Error("Not implemented");
  }

  clear(): void {
    throw new Error("Not implemented");
  }

  getToken(): string | null {
    throw new Error("Not implemented");
  }

  setToken(_token: string): void {
    throw new Error("Not implemented");
  }

  removeToken(): void {
    throw new Error("Not implemented");
  }
}
