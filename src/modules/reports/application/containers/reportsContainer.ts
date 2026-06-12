import ApiReportRepository from "@/modules/reports/infrastructure/ApiReportRepository";
import InitReportUseCase from "@/modules/reports/domain/use-cases/InitReportUseCase";
import GetReportsUseCase from "@/modules/reports/domain/use-cases/GetReportsUseCase";
import GetReportUseCase from "@/modules/reports/domain/use-cases/GetReportUseCase";
import SaveReportDraftUseCase from "@/modules/reports/domain/use-cases/SaveReportDraftUseCase";
import SignReportUseCase from "@/modules/reports/domain/use-cases/SignReportUseCase";
import CloseReportUseCase from "@/modules/reports/domain/use-cases/CloseReportUseCase";
import DownloadReportPdfUseCase from "@/modules/reports/domain/use-cases/DownloadReportPdfUseCase";

export function provideInitReportUseCase(): InitReportUseCase {
  const repo = new ApiReportRepository();
  return new InitReportUseCase(repo);
}

export function provideGetReportsUseCase(): GetReportsUseCase {
  const repo = new ApiReportRepository();
  return new GetReportsUseCase(repo);
}

export function provideGetReportUseCase(): GetReportUseCase {
  const repo = new ApiReportRepository();
  return new GetReportUseCase(repo);
}

export function provideSaveReportDraftUseCase(): SaveReportDraftUseCase {
  const repo = new ApiReportRepository();
  return new SaveReportDraftUseCase(repo);
}

export function provideSignReportUseCase(): SignReportUseCase {
  const repo = new ApiReportRepository();
  return new SignReportUseCase(repo);
}

export function provideCloseReportUseCase(): CloseReportUseCase {
  const repo = new ApiReportRepository();
  return new CloseReportUseCase(repo);
}

export function provideDownloadReportPdfUseCase(): DownloadReportPdfUseCase {
  const repo = new ApiReportRepository();
  return new DownloadReportPdfUseCase(repo);
}
