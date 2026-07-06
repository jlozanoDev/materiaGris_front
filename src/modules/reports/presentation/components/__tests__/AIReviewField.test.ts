import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AIReviewField from "../AIReviewField.vue";
import type { FieldReview } from "@/modules/reports/domain/entities/AIProcessing";

// ── Helpers ────────────────────────────────────────────────────────────────────

function createFieldReview(overrides?: Partial<FieldReview>): FieldReview {
  return {
    fieldKey: "diagnostico",
    fieldLabel: "Diagnóstico",
    fieldType: "text",
    currentValue: "",
    proposedValue: "HTA",
    confidence: 0.85,
    confidenceLevel: "high",
    action: "pending",
    ...overrides,
  };
}

function mountField(review: FieldReview) {
  return mount(AIReviewField, {
    props: { review },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("AIReviewField", () => {
  it("renders the AI suggestion header", () => {
    const wrapper = mountField(createFieldReview());
    expect(wrapper.text()).toContain("IA sugiere");
  });

  it("renders the current value", () => {
    const wrapper = mountField(
      createFieldReview({ currentValue: "valor actual" }),
    );
    expect(wrapper.text()).toContain("valor actual");
  });

  it("renders the proposed AI value", () => {
    const wrapper = mountField(
      createFieldReview({ proposedValue: "HTA" }),
    );
    expect(wrapper.text()).toContain("HTA");
  });

  describe("confidence bar", () => {
    it("renders confidence percentage", () => {
      const wrapper = mountField(
        createFieldReview({ confidence: 0.75 }),
      );
      expect(wrapper.text()).toContain("75%");
    });

    it("shows confidence dot when confidenceLevel is high", () => {
      const wrapper = mountField(
        createFieldReview({ confidenceLevel: "high", confidence: 0.9 }),
      );
      expect(wrapper.text()).toContain("90%");
    });

    it("shows confidence dot when confidenceLevel is medium", () => {
      const wrapper = mountField(
        createFieldReview({ confidenceLevel: "medium", confidence: 0.6 }),
      );
      expect(wrapper.text()).toContain("60%");
    });

    it("shows confidence dot when confidenceLevel is low", () => {
      const wrapper = mountField(
        createFieldReview({ confidenceLevel: "low", confidence: 0.3 }),
      );
      expect(wrapper.text()).toContain("30%");
    });
  });

  describe("action buttons", () => {
    it("emits accept when accept button is clicked", async () => {
      const wrapper = mountField(createFieldReview({ action: "pending" }));
      const acceptBtn = wrapper.find('[data-testid="accept-btn"]');
      expect(acceptBtn.exists()).toBe(true);
      await acceptBtn.trigger("click");
      expect(wrapper.emitted("accept")).toHaveLength(1);
      expect(wrapper.emitted("accept")?.[0]).toEqual(["diagnostico"]);
    });

    it("emits reject when reject button is clicked", async () => {
      const wrapper = mountField(createFieldReview({ action: "pending" }));
      const rejectBtn = wrapper.find('[data-testid="reject-btn"]');
      expect(rejectBtn.exists()).toBe(true);
      await rejectBtn.trigger("click");
      expect(wrapper.emitted("reject")).toHaveLength(1);
      expect(wrapper.emitted("reject")?.[0]).toEqual(["diagnostico"]);
    });

    it("emits edit with new value when edit button is clicked and input is filled", async () => {
      const wrapper = mountField(createFieldReview({
        action: "pending",
        proposedValue: "HTA",
      }));
      const editBtn = wrapper.find('[data-testid="edit-btn"]');
      expect(editBtn.exists()).toBe(true);
      await editBtn.trigger("click");

      // After clicking edit, an inline input should appear
      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);

      // Type a new value
      await editInput.setValue("Hipertensión Arterial");
      // Confirm the edit
      const confirmBtn = wrapper.find('[data-testid="confirm-edit-btn"]');
      await confirmBtn.trigger("click");

      expect(wrapper.emitted("edit")).toHaveLength(1);
      expect(wrapper.emitted("edit")?.[0]).toEqual([
        "diagnostico",
        "Hipertensión Arterial",
      ]);
    });

    it("shows inline edit input when action is 'edited'", () => {
      const wrapper = mountField(
        createFieldReview({
          action: "edited",
          editedValue: "Valor editado",
        }),
      );
      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);
      expect((editInput.element as HTMLInputElement).value).toBe("Valor editado");
    });

    it("does not show action buttons when action is accepted", () => {
      const wrapper = mountField(
        createFieldReview({ action: "accepted" }),
      );
      expect(wrapper.find('[data-testid="accept-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="reject-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
    });

    it("shows accepted badge when action is accepted", () => {
      const wrapper = mountField(
        createFieldReview({ action: "accepted" }),
      );
      expect(wrapper.text()).toContain("Aceptado");
    });

    it("shows rejected badge when action is rejected", () => {
      const wrapper = mountField(
        createFieldReview({ action: "rejected" }),
      );
      expect(wrapper.text()).toContain("Rechazado");
    });
  });
});
