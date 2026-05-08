export default class GetRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    return this.roleRepository.getById(id);
  }
}
