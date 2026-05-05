export default class GetAllUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async execute() {
    return this.userRepository.all()
  }
}
