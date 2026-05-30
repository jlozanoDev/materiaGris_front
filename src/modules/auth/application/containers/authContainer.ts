import ApiUserRepository from "@/modules/auth/infrastructure/ApiUserRepository";
import AuthService from "@/modules/auth/domain/services/AuthService";
import LocalStorageGateway from "@/modules/auth/infrastructure/LocalStorageGateway";

export function provideAuthService(): AuthService {
  const userRepo = new ApiUserRepository();
  const storageGateway = new LocalStorageGateway();
  return new AuthService(userRepo, storageGateway);
}
