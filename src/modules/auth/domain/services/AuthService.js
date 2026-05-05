export default class AuthService {
  /**
   * @param {import('@/shared/repositories/UserRepository').default} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  /**
   * Validates the stored access token.
   * If expired (401), attempts a token refresh.
   * Returns true if a valid session exists after the call.
   */
  async validateToken() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return false

    try {
      const user = await this.userRepository.me()
      if (user) {
        try { localStorage.setItem('user', JSON.stringify(user)) } catch (_) {}
        return true
      }
      return false
    } catch (e) {
      if (e && e.status === 401) {
        return this._tryRefresh()
      }
      return false
    }
  }

  async _tryRefresh() {
    try {
      const refreshData = await this.userRepository.refresh()
      if (!refreshData || !refreshData.access_token) {
        this._clearSession()
        return false
      }
      localStorage.setItem('access_token', refreshData.access_token)
      try {
        const user = await this.userRepository.me()
        if (!user) { this._clearSession(); return false }
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } catch (_) {
        this._clearSession()
        return false
      }
    } catch (_) {
      this._clearSession()
      return false
    }
  }

  /**
   * Logs the user out: calls the API logout endpoint and clears the local session.
   */
  async logout() {
    try {
      await this.userRepository.logout()
    } catch (_) {
      // ignore network errors — session is cleared regardless
    }
    this._clearSession()
  }

  _clearSession() {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    } catch (_) {}
  }
}
