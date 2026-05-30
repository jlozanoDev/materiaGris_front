import type { IUserRepository, IStorageGateway } from "@/shared/types";

export default class AuthService {
  constructor(
    public readonly userRepository: IUserRepository,
    public readonly storageGateway: IStorageGateway,
  ) {}

  async login(credentials: { email: string; password: string }): Promise<any> {
    const result = await this.userRepository.login(credentials);
    if (result && result.access_token) {
      this.storageGateway.set("access_token", result.access_token);
    }
    return result;
  }

  async validateToken(): Promise<boolean> {
    const token = this.storageGateway.get("access_token");
    if (!token) return false;

    try {
      const user = await this.userRepository.me();
      if (user) {
        this.storageGateway.set("user", JSON.stringify(user));
        return true;
      }
      return false;
    } catch (e: any) {
      if (e && e.status === 401) {
        return this.tryRefresh();
      }
      return false;
    }
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const refreshData = await this.userRepository.refresh();
      if (!refreshData || !refreshData.access_token) {
        this.clearSessionInternal();
        return false;
      }
      this.storageGateway.set("access_token", refreshData.access_token);
      try {
        const user = await this.userRepository.me();
        if (!user) {
          this.clearSessionInternal();
          return false;
        }
        this.storageGateway.set("user", JSON.stringify(user));
        return true;
      } catch (_) {
        this.clearSessionInternal();
        return false;
      }
    } catch (e: any) {
      if (e && e.status === 401) {
        this.clearSessionInternal();
        return false;
      }
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.userRepository.logout();
    } catch (_) {
      // ignore network errors — session is cleared regardless
    }
    this.clearSessionInternal();
  }

  clearSession(): void {
    this.clearSessionInternal();
  }

  private clearSessionInternal(): void {
    this.storageGateway.remove("access_token");
    this.storageGateway.remove("refresh_token");
    this.storageGateway.remove("user");
  }
}
