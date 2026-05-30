import type { RoleRepository } from "@/modules/admin/roles/domain/repositories/RoleRepository";

export default class GetRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(): Promise<any> {
    return this.roleRepository.all();
  }
}
