import type { FieldConfig } from "@/shared/types";

/**
 * 3-tier value mapper that aligns LLM-extracted JSON keys to DynamicFormRenderer
 * template fields, using `ai_help_description` as the semantic bridge.
 *
 * Tiers (per field, picks the best LLM key):
 *   1. Exact key match         → score 1.0
 *   2. Normalized label match  → score 0.8
 *   3. Jaccard token overlap   → score [0..1]
 *
 * Fields WITHOUT `ai_help_description` are skipped (non-AI fields like separators).
 * LLM keys whose best-matching score is ≤ 0.3 are discarded.
 *
 * @param llmData   Key-value data returned by the LLM (snake_case or free-form keys).
 * @param fields    Template field definitions from the DynamicFormRenderer structure.
 * @returns         A record mapping form field keys to their matched LLM values.
 *                  Only fields with a confidence > 0.3 are included.
 */
/**
 * Result of matching an LLM key to a form field.
 */
export interface AIMatchedField {
  /** The form field key (FieldConfig.key) */
  fieldKey: string;
  /** The matched LLM key from extracted_data */
  llmKey: string;
  /** The value from extracted_data for this matched key */
  value: any;
  /** Best matching score (0..1) */
  score: number;
}

/**
 * 3-tier field mapper that returns the full matching information
 * (field key, LLM key, value, score) for each matched field.
 *
 * Used by the AI review panel to display per-field proposals with
 * confidence scores keyed by the original LLM key.
 *
 * @param llmData  Key-value data returned by the LLM.
 * @param fields   Template field definitions.
 * @returns        Array of matched fields with scores > 0.3.
 */
export function matchAIFields(
  llmData: Record<string, any>,
  fields: FieldConfig[],
): AIMatchedField[] {
  const result: AIMatchedField[] = [];

  for (const field of fields) {
    if (!field.ai_help_description) continue;

    const best = findBestMatch(llmData, field);
    if (best) {
      result.push(best);
    }
  }

  return result;
}

/**
 * Find the best LLM key match for a single field config.
 * Returns null if no match exceeds the 0.3 threshold.
 */
function findBestMatch(
  llmData: Record<string, any>,
  field: FieldConfig,
): AIMatchedField | null {
  let bestKey: string | null = null;
  let bestScore = 0;

  for (const [llmKey] of Object.entries(llmData)) {
    let score = 0;

    // Tier 1: Exact key match
    if (llmKey === field.key) {
      score = 1.0;
    } else {
      // Tier 2: Normalized label match
      const normalizedLlmKey = normalize(llmKey);
      const normalizedLabel = normalize(field.label);
      if (normalizedLlmKey === normalizedLabel) {
        score = 0.8;
      } else {
        // Tier 3: Jaccard token overlap on ai_help_description
        score = jaccardSimilarity(llmKey, field.ai_help_description ?? "");
      }
    }

    if (score > bestScore) {
      bestKey = llmKey;
      bestScore = score;
    }
  }

  if (bestKey !== null && bestScore > 0.3) {
    return {
      fieldKey: field.key,
      llmKey: bestKey,
      value: llmData[bestKey],
      score: bestScore,
    };
  }

  return null;
}

export function aiValueMapper(
  llmData: Record<string, any>,
  fields: FieldConfig[],
): Record<string, any> {
  const matched = matchAIFields(llmData, fields);
  const result: Record<string, any> = {};
  for (const m of matched) {
    result[m.fieldKey] = m.value;
  }
  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

/**
 * Normalize a string for comparison: lowercase, trim, collapse whitespace,
 * replace underscores with spaces, strip non-alphanumeric characters (except spaces),
 * and normalize accented characters to their ASCII base equivalents.
 */
const ACCENT_MAP: Record<string, string> = {
  á: "a", é: "e", í: "i", ó: "o", ú: "u",
  ü: "u", ñ: "n",
};

/**
 * Normalize a string for comparison: lowercase, trim, collapse whitespace,
 * replace underscores with spaces, strip non-alphanumeric characters,
 * and translate accented/Spanish-special characters to their ASCII base.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9\s]/g, (ch) => ACCENT_MAP[ch] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compute Jaccard similarity coefficient between two strings.
 * Tokenizes on whitespace after normalization.
 */
function jaccardSimilarity(a: string, b: string): number {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));

  if (aTokens.size === 0 && bTokens.size === 0) return 1;
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection++;
  }

  const union = aTokens.size + bTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Tokenize a string into normalized lower-case word tokens.
 */
function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 0);
}
