import type { Credentials, AuthUser } from "@/shared/types";

export interface UserRepository {
  login(credentials: Credentials): Promise<any>;
  forgot(email: string): Promise<any>;
  me(): Promise<AuthUser>;
  logout(): Promise<any>;
  refresh(): Promise<any>;
  reset(data: { token: string; password: string; password_confirmation: string }): Promise<any>;
}
