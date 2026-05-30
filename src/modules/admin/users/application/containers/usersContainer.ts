import ApiAdminUserRepository from "@/modules/admin/users/infrastructure/ApiAdminUserRepository";
import GetAllUsersUseCase from "@/modules/admin/users/domain/use-cases/GetAllUsersUseCase";
import CreateUserUseCase from "@/modules/admin/users/domain/use-cases/CreateUserUseCase";
import UpdateUserUseCase from "@/modules/admin/users/domain/use-cases/UpdateUserUseCase";
import DeleteUserUseCase from "@/modules/admin/users/domain/use-cases/DeleteUserUseCase";

export function provideGetAllUsersUseCase(): GetAllUsersUseCase {
  const userRepo = new ApiAdminUserRepository();
  return new GetAllUsersUseCase(userRepo);
}

export function provideCreateUserUseCase(): CreateUserUseCase {
  const userRepo = new ApiAdminUserRepository();
  return new CreateUserUseCase(userRepo);
}

export function provideUpdateUserUseCase(): UpdateUserUseCase {
  const userRepo = new ApiAdminUserRepository();
  return new UpdateUserUseCase(userRepo);
}

export function provideDeleteUserUseCase(): DeleteUserUseCase {
  const userRepo = new ApiAdminUserRepository();
  return new DeleteUserUseCase(userRepo);
}
