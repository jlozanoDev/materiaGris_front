import ApiUserRepository from "@/modules/auth/infrastructure/ApiUserRepository";
import GetAllUsersUseCase from "@/modules/admin/users/domain/use-cases/GetAllUsersUseCase";
import CreateUserUseCase from "@/modules/admin/users/domain/use-cases/CreateUserUseCase";
import UpdateUserUseCase from "@/modules/admin/users/domain/use-cases/UpdateUserUseCase";
import DeleteUserUseCase from "@/modules/admin/users/domain/use-cases/DeleteUserUseCase";

export function provideGetAllUsersUseCase() {
  const userRepo = new ApiUserRepository();
  return new GetAllUsersUseCase(userRepo);
}

export function provideCreateUserUseCase() {
  const userRepo = new ApiUserRepository();
  return new CreateUserUseCase(userRepo);
}

export function provideUpdateUserUseCase() {
  const userRepo = new ApiUserRepository();
  return new UpdateUserUseCase(userRepo);
}

export function provideDeleteUserUseCase() {
  const userRepo = new ApiUserRepository();
  return new DeleteUserUseCase(userRepo);
}

export default {
  provideGetAllUsersUseCase,
  provideCreateUserUseCase,
  provideUpdateUserUseCase,
  provideDeleteUserUseCase,
};
