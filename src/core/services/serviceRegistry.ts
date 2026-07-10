import type { IAuthService, IStorageGateway } from "@/shared/types";
import type { useClinicStore } from "@/core/store/clinic";

let _authService: IAuthService | null = null;
let _storageGateway: IStorageGateway | null = null;
let _clinicStore: ReturnType<typeof useClinicStore> | null = null;

export function setAuthService(svc: IAuthService): void {
  _authService = svc;
}

export function getAuthService(): IAuthService {
  if (!_authService) throw new Error("AuthService not registered");
  return _authService;
}

export function setStorageGateway(gw: IStorageGateway): void {
  _storageGateway = gw;
}

export function getStorageGateway(): IStorageGateway {
  if (!_storageGateway) throw new Error("StorageGateway not registered");
  return _storageGateway;
}

export function setClinicStore(store: ReturnType<typeof useClinicStore>): void {
  _clinicStore = store;
}

export function getClinicStore(): ReturnType<typeof useClinicStore> {
  if (!_clinicStore) throw new Error("ClinicStore not registered");
  return _clinicStore;
}
