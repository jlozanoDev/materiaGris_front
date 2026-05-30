import type { UserRepository as AuthUserRepository } from "@/modules/auth/domain/repositories/UserRepository";
import type { UserRepository as AdminUserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";

export interface UserRepository extends AuthUserRepository, AdminUserRepository {}
