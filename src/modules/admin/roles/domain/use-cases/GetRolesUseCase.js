export default class GetRolesUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute() {
    return this.roleRepository.all();
  }
}
