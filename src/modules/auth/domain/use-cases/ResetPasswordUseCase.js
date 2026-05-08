export default class ResetPasswordUseCase {
  /**
   * @param {import('@/shared/repositories/UserRepository').default} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {string} email
   * @param {string} token
   * @param {string} password
   * @param {string} passwordConfirmation
   */
  async execute(email, token, password, passwordConfirmation) {
    return this.userRepository.reset(email, token, password, passwordConfirmation);
  }
}
