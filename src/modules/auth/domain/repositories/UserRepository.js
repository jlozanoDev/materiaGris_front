export default class UserRepository {
  async login(credentials) {
    throw new Error("Not implemented");
  }

  async forgot(email) {
    throw new Error("Not implemented");
  }

  async reset(email, token, password, passwordConfirmation) {
    throw new Error("Not implemented");
  }

  async me() {
    throw new Error("Not implemented");
  }

  async logout() {
    throw new Error("Not implemented");
  }

  async refresh() {
    throw new Error("Not implemented");
  }
}
