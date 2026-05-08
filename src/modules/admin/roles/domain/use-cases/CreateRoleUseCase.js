export default class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(payload) {
    return this.roleRepository.create(payload);
  }
}
