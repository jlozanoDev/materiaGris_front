export default class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(credentials) {
    // devuelve token o error
    return this.userRepository.login(credentials);
  }
}
