import ApiReportRepository from "@/modules/reports/infrastructure/ApiReportRepository";
import InitReportUseCase from "@/modules/reports/domain/use-cases/InitReportUseCase";
import GetReportsUseCase from "@/modules/reports/domain/use-cases/GetReportsUseCase";
import GetReportUseCase from "@/modules/reports/domain/use-cases/GetReportUseCase";
import SaveReportDraftUseCase from "@/modules/reports/domain/use-cases/SaveReportDraftUseCase";
import SignReportUseCase from "@/modules/reports/domain/use-cases/SignReportUseCase";
import ArchiveReportUseCase from "@/modules/reports/domain/use-cases/ArchiveReportUseCase";
import DeleteReportUseCase from "@/modules/reports/domain/use-cases/DeleteReportUseCase";
import DownloadReportPdfUseCase from "@/modules/reports/domain/use-cases/DownloadReportPdfUseCase";
import GetActiveTemplatesUseCase from "@/modules/reports/domain/use-cases/GetActiveTemplatesUseCase";
import TranscribeAudioUseCase from "@/modules/reports/domain/use-cases/TranscribeAudioUseCase";
import ExtractReportDataUseCase from "@/modules/reports/domain/use-cases/ExtractReportDataUseCase";

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

export function provideArchiveReportUseCase(): ArchiveReportUseCase {
  const repo = new ApiReportRepository();
  return new ArchiveReportUseCase(repo);
}

export function provideDownloadReportPdfUseCase(): DownloadReportPdfUseCase {
  const repo = new ApiReportRepository();
  return new DownloadReportPdfUseCase(repo);
}

export function provideDeleteReportUseCase(): DeleteReportUseCase {
  const repo = new ApiReportRepository();
  return new DeleteReportUseCase(repo);
}

export function provideGetActiveTemplatesUseCase(): GetActiveTemplatesUseCase {
  const repo = new ApiReportRepository();
  return new GetActiveTemplatesUseCase(repo);
}

export function provideTranscribeAudioUseCase(): TranscribeAudioUseCase {
  const repo = new ApiReportRepository();
  return new TranscribeAudioUseCase(repo);
}

export function provideExtractReportDataUseCase(): ExtractReportDataUseCase {
  const repo = new ApiReportRepository();
  return new ExtractReportDataUseCase(repo);
}
