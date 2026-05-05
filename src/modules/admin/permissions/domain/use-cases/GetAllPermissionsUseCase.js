export default class GetAllPermissionsUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository
  }

  async execute() {
    return this.permissionRepository.all()
  }
}
