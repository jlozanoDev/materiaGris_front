/**
 * Domain entities for the AI-powered dictation and report autofill module.
 *
 * @module reports/domain/entities/AIProcessing
 */

/**
 * Represents a segment of speech attributed to a single speaker
 * from the transcription diarization output.
 */
export interface AISpeakerSegment {
  /** Speaker label, e.g. "Speaker 1 (Médico)" or "Speaker 2 (Paciente)" */
  speaker: string
  /** Transcribed text for this segment */
  text: string
  /** Start time of the segment in seconds */
  start: number
  /** End time of the segment in seconds */
  end: number
}

/**
 * Full transcription result returned by the backend after
 * processing an audio recording through Whisper (or similar).
 */
export interface TranscriptionResult {
  /** Complete transcript text with speaker labels */
  transcript: string
  /** Array of diarized speaker segments */
  segments: AISpeakerSegment[]
  /** Detected language code, e.g. "es" for Spanish */
  language: string
  /** Total duration of the audio in seconds */
  duration_seconds: number
}

/**
 * Structured data extracted from a transcript by an LLM,
 * ready to be mapped to report form fields.
 */
export interface LLMExtractionResult {
  /** Key-value pairs of extracted field data */
  extracted_data: Record<string, any>
  /** Per-field confidence score (0.0 – 1.0) */
  confidence_scores: Record<string, number>
  /** Warning messages about missing or uncertain fields */
  warnings: string[]
  /** Total processing time in milliseconds */
  processing_time_ms: number
}

/**
 * Valid states for the AI dictation pipeline state machine.
 */
export type AIPipelineState =
  | "idle"
  | "recording"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "reviewing"
  | "done"
  | "error"

/**
 * A single chunk of recorded audio data captured from MediaRecorder
 * during a recording session.
 */
export interface RecordingChunk {
  /** Raw audio blob (e.g. audio/webm with Opus codec) */
  blob: Blob
  /** Timestamp when the chunk was captured (epoch ms) */
  timestamp: number
}

// ── Review types for field-by-field AI review panel ────────────────────────────

/**
 * Per-field review action state.
 * - pending: awaiting user decision
 * - accepted: user accepted the proposed AI value
 * - rejected: user rejected the proposed AI value (keeps original)
 * - edited: user modified the proposed AI value before accepting
 */
export type ReviewAction = "pending" | "accepted" | "rejected" | "edited"

/**
 * Confidence level derived from numeric confidence score.
 * - high: ≥ 0.8 (green)
 * - medium: ≥ 0.5 (amber/yellow)
 * - low: < 0.5 (red)
 */
export type ConfidenceLevel = "high" | "medium" | "low"

/**
 * Represents a single field in the AI review panel.
 * Maps an LLM-extracted field to its form counterpart with
 * confidence indicator and current review action state.
 */
export interface FieldReview {
  /** Form field key (matches FieldConfig.key) */
  fieldKey: string
  /** Human-readable field label from the template */
  fieldLabel: string
  /** Field type from FieldConfig (text, number, select, etc.) */
  fieldType: string
  /** Current value in the form */
  currentValue: unknown
  /** Proposed AI-extracted value */
  proposedValue: unknown
  /** Numeric confidence score (0.0 – 1.0), defaults to 0.5 */
  confidence: number
  /** Derived confidence level for traffic-light display */
  confidenceLevel: ConfidenceLevel
  /** Current review action state */
  action: ReviewAction
  /** User-edited value (only set when action === "edited") */
  editedValue?: unknown
}
