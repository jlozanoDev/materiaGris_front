export default class ForgotPasswordUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async execute(email) {
    // devuelve { status, data } o lanza
    return this.userRepository.forgot(email)
  }
}
