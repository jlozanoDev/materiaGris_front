export default class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async execute(payload) {
    return this.userRepository.create(payload)
  }
}
