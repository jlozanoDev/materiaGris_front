export default class User {
  constructor({ id, name, email, role, is_active, permissions = [] } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.is_active = is_active;
    this.permissions = permissions;
  }
}
