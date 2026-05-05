export default class DeleteRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository
  }

  async execute(id) {
    return this.roleRepository.delete(id)
  }
}
