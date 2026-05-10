export default class UserRepository {
  async login(_credentials) {
    throw new Error("Not implemented");
  }

  async forgot(_email) {
    throw new Error("Not implemented");
  }

  async reset(_email, _token, _password, _passwordConfirmation) {
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
