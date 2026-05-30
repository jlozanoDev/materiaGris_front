import type { IStorageGateway } from "@/shared/types";

export default class LocalStorageGateway implements IStorageGateway {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* noop */
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      /* noop */
    }
  }

  getToken(): string | null {
    return this.get("access_token");
  }

  setToken(token: string): void {
    this.set("access_token", token);
  }

  removeToken(): void {
    this.remove("access_token");
  }
}
