export default class UpdateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id, payload) {
    return this.roleRepository.update(id, payload);
  }
}
