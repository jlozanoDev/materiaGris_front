import ApiRoleRepository from "@/modules/admin/roles/infrastructure/ApiRoleRepository";
import GetRolesUseCase from "@/modules/admin/roles/domain/use-cases/GetRolesUseCase";
import GetRoleUseCase from "@/modules/admin/roles/domain/use-cases/GetRoleUseCase";
import CreateRoleUseCase from "@/modules/admin/roles/domain/use-cases/CreateRoleUseCase";
import UpdateRoleUseCase from "@/modules/admin/roles/domain/use-cases/UpdateRoleUseCase";
import DeleteRoleUseCase from "@/modules/admin/roles/domain/use-cases/DeleteRoleUseCase";

export function provideGetRolesUseCase(): GetRolesUseCase {
  const roleRepo = new ApiRoleRepository();
  return new GetRolesUseCase(roleRepo);
}

export function provideGetRoleUseCase(): GetRoleUseCase {
  const roleRepo = new ApiRoleRepository();
  return new GetRoleUseCase(roleRepo);
}

export function provideCreateRoleUseCase(): CreateRoleUseCase {
  const roleRepo = new ApiRoleRepository();
  return new CreateRoleUseCase(roleRepo);
}

export function provideUpdateRoleUseCase(): UpdateRoleUseCase {
  const roleRepo = new ApiRoleRepository();
  return new UpdateRoleUseCase(roleRepo);
}

export function provideDeleteRoleUseCase(): DeleteRoleUseCase {
  const roleRepo = new ApiRoleRepository();
  return new DeleteRoleUseCase(roleRepo);
}
