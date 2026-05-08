export default class User {
  constructor({ id, name, email, permissions = [], is_active } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.permissions = permissions;
    this.is_active = is_active;
  }
}
