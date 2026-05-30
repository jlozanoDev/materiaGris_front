import ApiPermissionRepository from "@/modules/admin/permissions/infrastructure/ApiPermissionRepository";
import GetAllPermissionsUseCase from "@/modules/admin/permissions/domain/use-cases/GetAllPermissionsUseCase";

export function provideGetAllPermissionsUseCase(): GetAllPermissionsUseCase {
  const permissionRepo = new ApiPermissionRepository();
  return new GetAllPermissionsUseCase(permissionRepo);
}
