import ApiReportTemplateRepository from "@/modules/admin/report-template/infrastructure/ApiReportTemplateRepository";
import GetReportTemplatesUseCase from "@/modules/admin/report-template/domain/use-cases/GetReportTemplatesUseCase";
import GetReportTemplateUseCase from "@/modules/admin/report-template/domain/use-cases/GetReportTemplateUseCase";
import CreateReportTemplateUseCase from "@/modules/admin/report-template/domain/use-cases/CreateReportTemplateUseCase";
import UpdateReportTemplateUseCase from "@/modules/admin/report-template/domain/use-cases/UpdateReportTemplateUseCase";
import DeleteReportTemplateUseCase from "@/modules/admin/report-template/domain/use-cases/DeleteReportTemplateUseCase";

export function provideGetReportTemplatesUseCase(): GetReportTemplatesUseCase {
  const repo = new ApiReportTemplateRepository();
  return new GetReportTemplatesUseCase(repo);
}

export function provideGetReportTemplateUseCase(): GetReportTemplateUseCase {
  const repo = new ApiReportTemplateRepository();
  return new GetReportTemplateUseCase(repo);
}

export function provideCreateReportTemplateUseCase(): CreateReportTemplateUseCase {
  const repo = new ApiReportTemplateRepository();
  return new CreateReportTemplateUseCase(repo);
}

export function provideUpdateReportTemplateUseCase(): UpdateReportTemplateUseCase {
  const repo = new ApiReportTemplateRepository();
  return new UpdateReportTemplateUseCase(repo);
}

export function provideDeleteReportTemplateUseCase(): DeleteReportTemplateUseCase {
  const repo = new ApiReportTemplateRepository();
  return new DeleteReportTemplateUseCase(repo);
}
