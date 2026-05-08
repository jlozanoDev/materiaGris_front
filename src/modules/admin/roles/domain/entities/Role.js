export default class Role {
  constructor({ id, name, slug, permissions = [] } = {}) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.permissions = permissions;
  }
}
