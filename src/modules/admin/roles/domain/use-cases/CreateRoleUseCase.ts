import type { RoleRepository } from "@/modules/admin/roles/domain/repositories/RoleRepository";

export default class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(payload: Record<string, unknown>): Promise<any> {
    return this.roleRepository.create(payload);
  }
}
