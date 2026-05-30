import type { PermissionRepository } from "@/modules/admin/permissions/domain/repositories/PermissionRepository";

export default class GetAllPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(): Promise<any> {
    return this.permissionRepository.all();
  }
}
