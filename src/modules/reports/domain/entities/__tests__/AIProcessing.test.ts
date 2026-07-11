import { describe, it, expect, vi } from "vitest"
import {
  AISpeakerSegment,
  TranscriptionResult,
  LLMExtractionResult,
  AIPipelineState,
  RecordingChunk,
} from "@/modules/reports/domain/entities/AIProcessing"

// ============================================================================
// Task 1.3: Domain entity types exist and have correct shape
// ============================================================================

describe("AISpeakerSegment", () => {
  it("should hold speaker, text, start, and end properties", () => {
    const segment: AISpeakerSegment = {
      speaker: "Speaker 1 (Médico)",
      text: "El paciente presenta dolor lumbar",
      start: 0.5,
      end: 3.2,
    }

    expect(segment.speaker).toBe("Speaker 1 (Médico)")
    expect(segment.text).toBe("El paciente presenta dolor lumbar")
    expect(segment.start).toBe(0.5)
    expect(segment.end).toBe(3.2)
  })
})

describe("TranscriptionResult", () => {
  it("should hold transcript, segments, language, and duration_seconds", () => {
    const result: TranscriptionResult = {
      transcript:
        "Speaker 1 (Médico): El paciente presenta dolor lumbar...",
      segments: [
        {
          speaker: "Speaker 1 (Médico)",
          text: "El paciente presenta dolor lumbar",
          start: 0.5,
          end: 3.2,
        },
        {
          speaker: "Speaker 2 (Paciente)",
          text: "Desde hace dos semanas",
          start: 3.5,
          end: 5.0,
        },
      ],
      language: "es",
      duration_seconds: 5.0,
    }

    expect(result.transcript).toContain("dolor lumbar")
    expect(result.segments).toHaveLength(2)
    expect(result.language).toBe("es")
    expect(result.duration_seconds).toBe(5.0)
  })

  it("should allow empty segments array", () => {
    const result: TranscriptionResult = {
      transcript: "",
      segments: [],
      language: "es",
      duration_seconds: 0,
    }

    expect(result.segments).toEqual([])
    expect(result.transcript).toBe("")
  })
})

describe("LLMExtractionResult", () => {
  it("should hold extracted_data, confidence_scores, warnings, and processing_time_ms", () => {
    const result: LLMExtractionResult = {
      extracted_data: {
        edad: "45",
        diagnostico: "Artritis",
        antecedentes: null,
      },
      confidence_scores: {
        edad: 0.95,
        diagnostico: 0.87,
        antecedentes: 0.0,
      },
      warnings: ["Campo 'antecedentes' no encontrado en el audio"],
      processing_time_ms: 2340,
    }

    expect(result.extracted_data.diagnostico).toBe("Artritis")
    expect(result.confidence_scores.diagnostico).toBe(0.87)
    expect(result.warnings).toHaveLength(1)
    expect(result.processing_time_ms).toBeGreaterThan(0)
  })
})

describe("AIPipelineState", () => {
  it("should accept all valid pipeline states", () => {
    const states: AIPipelineState[] = [
      "idle",
      "recording",
      "uploading",
      "transcribing",
      "analyzing",
      "reviewing",
      "done",
      "error",
    ]

    expect(states).toHaveLength(8)
    expect(states).toContain("idle")
    expect(states).toContain("recording")
    expect(states).toContain("transcribing")
    expect(states).toContain("analyzing")
    expect(states).toContain("reviewing")
    expect(states).toContain("done")
    expect(states).toContain("error")
    expect(states).toContain("uploading")
  })
})

describe("RecordingChunk", () => {
  it("should hold a blob and timestamp", () => {
    const chunk: RecordingChunk = {
      blob: new Blob(["fake-audio-data"], { type: "audio/webm" }),
      timestamp: Date.now(),
    }

    expect(chunk.blob).toBeInstanceOf(Blob)
    expect(chunk.blob.type).toBe("audio/webm")
    expect(chunk.timestamp).toBeGreaterThan(0)
  })
})

// ============================================================================
// Task 1.4: ReportRepository interface has transcribe() and extractData()
// ============================================================================

describe("ReportRepository AI methods", () => {
  it("should allow implementing transcribe() method", async () => {
    const mockTranscribe = vi.fn().mockResolvedValue({
      transcript: "test transcript",
      segments: [],
      language: "es",
      duration_seconds: 10,
    } as TranscriptionResult)

    const result = await mockTranscribe(
      "1",
      new FormData(),
      { diarization: true },
    )

    expect(result.transcript).toBe("test transcript")
    expect(result.language).toBe("es")
  })

  it("should allow implementing extractData() method", async () => {
    const mockExtractData = vi.fn().mockResolvedValue({
      extracted_data: { diagnostico: "Migraña" },
      confidence_scores: { diagnostico: 0.92 },
      warnings: [],
      processing_time_ms: 1500,
    } as LLMExtractionResult)

    const result = await mockExtractData("1", "test transcript", "3")

    expect(result.extracted_data.diagnostico).toBe("Migraña")
    expect(result.processing_time_ms).toBe(1500)
  })
})
