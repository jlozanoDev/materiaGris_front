import type { RoleRepository } from "@/modules/admin/roles/domain/repositories/RoleRepository";

export default class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number | string, payload: Record<string, unknown>): Promise<any> {
    return this.roleRepository.update(id, payload);
  }
}
