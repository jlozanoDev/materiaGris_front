export default class AuthService {
  constructor(userRepository, storageGateway) {
    this.userRepository = userRepository;
    this.storageGateway = storageGateway;
  }

  async login(credentials) {
    const result = await this.userRepository.login(credentials);
    if (result && result.access_token) {
      this.storageGateway.set("access_token", result.access_token);
    }
    return result;
  }

  async validateToken() {
    const token = this.storageGateway.get("access_token");
    if (!token) return false;

    try {
      const user = await this.userRepository.me();
      if (user) {
        this.storageGateway.set("user", JSON.stringify(user));
        return true;
      }
      return false;
    } catch (e) {
      if (e && e.status === 401) {
        return this._tryRefresh();
      }
      return false;
    }
  }

  async _tryRefresh() {
    try {
      const refreshData = await this.userRepository.refresh();
      if (!refreshData || !refreshData.access_token) {
        this._clearSession();
        return false;
      }
      this.storageGateway.set("access_token", refreshData.access_token);
      try {
        const user = await this.userRepository.me();
        if (!user) {
          this._clearSession();
          return false;
        }
        this.storageGateway.set("user", JSON.stringify(user));
        return true;
      } catch (_) {
        this._clearSession();
        return false;
      }
    } catch (e) {
      if (e && e.status === 401) {
        this._clearSession();
        return false;
      }
      return false;
    }
  }

  async logout() {
    try {
      await this.userRepository.logout();
    } catch (_) {
      // ignore network errors — session is cleared regardless
    }
    this._clearSession();
  }

  clearSession() {
    this._clearSession();
  }

  _clearSession() {
    this.storageGateway.remove("access_token");
    this.storageGateway.remove("refresh_token");
    this.storageGateway.remove("user");
  }
}
