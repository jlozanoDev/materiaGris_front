import StorageGateway from "@/modules/auth/domain/services/StorageGateway";

export default class LocalStorageGateway extends StorageGateway {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch { /* noop */ }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch { /* noop */ }
  }
}
