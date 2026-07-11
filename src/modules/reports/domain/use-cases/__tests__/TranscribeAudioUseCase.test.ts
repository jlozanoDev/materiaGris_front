import { describe, it, expect, vi } from "vitest";
import TranscribeAudioUseCase from "@/modules/reports/domain/use-cases/TranscribeAudioUseCase";
import type { ReportRepository } from "@/modules/reports/domain/repositories/ReportRepository";

function createMockRepo(): ReportRepository {
  return {
    initReport: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    saveDraft: vi.fn(),
    sign: vi.fn(),
    archive: vi.fn(),
    downloadPdf: vi.fn(),
    getActiveTemplates: vi.fn(),
    delete: vi.fn(),
    transcribe: vi.fn(),
    extractData: vi.fn(),
  };
}

describe("TranscribeAudioUseCase", () => {
  it("calls repository.transcribe() with reportId, FormData, and options", async () => {
    const repo = createMockRepo();
    const expected = {
      transcript: "test transcript",
      segments: [],
      language: "es",
      duration_seconds: 30,
    };
    (repo.transcribe as any).mockResolvedValue(expected);

    const useCase = new TranscribeAudioUseCase(repo);
    const audioBlob = new Blob(["fake-audio"], { type: "audio/webm" });
    const result = await useCase.execute(42, audioBlob, {
      diarization: true,
      language: "es",
    });

    expect(repo.transcribe).toHaveBeenCalledWith(
      42,
      expect.any(FormData),
      { diarization: true, language: "es" },
    );

    // Verify FormData content (Blob becomes File when appended to FormData)
    const formData = (repo.transcribe as any).mock.calls[0][1];
    const audioEntry = formData.get("audio");
    expect(audioEntry).toBeInstanceOf(Blob);
    expect(audioEntry.size).toBe(audioBlob.size);
    expect(audioEntry.type).toBe(audioBlob.type);
    expect(formData.get("diarization")).toBe("true");
    expect(formData.get("language")).toBe("es");

    expect(result).toEqual(expected);
  });

  it("works without optional options (no diarization/language)", async () => {
    const repo = createMockRepo();
    const expected = {
      transcript: "plain transcript",
      segments: [],
      language: "es",
      duration_seconds: 10,
    };
    (repo.transcribe as any).mockResolvedValue(expected);

    const useCase = new TranscribeAudioUseCase(repo);
    const audioBlob = new Blob(["audio"], { type: "audio/webm" });
    const result = await useCase.execute("r1", audioBlob);

    expect(repo.transcribe).toHaveBeenCalledWith(
      "r1",
      expect.any(FormData),
      undefined,
    );
    expect(result).toEqual(expected);
  });

  it("throws when audioBlob is empty", async () => {
    const repo = createMockRepo();
    const useCase = new TranscribeAudioUseCase(repo);
    const emptyBlob = new Blob([], { type: "audio/webm" });

    await expect(useCase.execute(1, emptyBlob)).rejects.toThrow(
      "El archivo de audio está vacío",
    );
    expect(repo.transcribe).not.toHaveBeenCalled();
  });

  it("propagates repository error", async () => {
    const repo = createMockRepo();
    (repo.transcribe as any).mockRejectedValue(
      new Error("Transcription failed"),
    );

    const useCase = new TranscribeAudioUseCase(repo);
    const audioBlob = new Blob(["audio"], { type: "audio/webm" });

    await expect(useCase.execute(1, audioBlob)).rejects.toThrow(
      "Transcription failed",
    );
  });
});
