import type { RoleRepository } from "@/modules/admin/roles/domain/repositories/RoleRepository";

export default class DeleteRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number | string): Promise<any> {
    return this.roleRepository.delete(id);
  }
}
