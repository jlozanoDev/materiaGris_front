import ApiPermissionRepository from '@/modules/admin/permissions/infrastructure/ApiPermissionRepository'
import GetAllPermissionsUseCase from '@/modules/admin/permissions/domain/use-cases/GetAllPermissionsUseCase'

export function provideGetAllPermissionsUseCase() {
  const permissionRepo = new ApiPermissionRepository()
  return new GetAllPermissionsUseCase(permissionRepo)
}

export default { provideGetAllPermissionsUseCase }
