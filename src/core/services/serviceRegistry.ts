import type { IAuthService, IStorageGateway } from "@/shared/types";

let _authService: IAuthService | null = null;
let _storageGateway: IStorageGateway | null = null;

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
