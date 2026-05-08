export default class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, payload) {
    return this.userRepository.update(id, payload);
  }
}
