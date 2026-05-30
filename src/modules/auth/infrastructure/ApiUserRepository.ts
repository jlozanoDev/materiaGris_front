import type { UserRepository } from "@/modules/auth/domain/repositories/UserRepository";
import { fetchClient } from "@/core/api/httpClient";
import type { Credentials, AuthUser } from "@/shared/types";

export default class ApiUserRepository implements UserRepository {
  async login(credentials: Credentials): Promise<any> {
    try {
      return await fetchClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    } catch (err: any) {
      if (err && err.status === 401) throw err;
      if (err && err.body) throw new Error(err.body.message || "Error en el login");
      throw err;
    }
  }

  async forgot(email: string): Promise<any> {
    try {
      const data = await fetchClient("/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { status: 200, data };
    } catch (err: any) {
      if (err && err.status) return { status: err.status, data: err.body };
      throw err;
    }
  }

  async me(): Promise<AuthUser> {
    return await fetchClient("/auth/me", { method: "GET", ignoreUnauthorized: true });
  }

  async logout(): Promise<any> {
    return fetchClient("/auth/logout", { method: "POST", ignoreUnauthorized: true });
  }

  async refresh(): Promise<any> {
    return await fetchClient("/auth/refresh", { method: "POST", ignoreUnauthorized: true });
  }

  async reset(data: { token: string; password: string; password_confirmation: string }): Promise<any> {
    return fetchClient("/auth/reset", {
      method: "POST",
      ignoreUnauthorized: true,
      body: JSON.stringify(data),
    });
  }
}
