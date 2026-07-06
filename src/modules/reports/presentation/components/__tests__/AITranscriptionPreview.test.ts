import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AITranscriptionPreview from "../AITranscriptionPreview.vue";

describe("AITranscriptionPreview", () => {
  it("renders loading skeleton when loading", () => {
    const wrapper = mount(AITranscriptionPreview, {
      props: { segments: [], loading: true },
    });
    expect(wrapper.findAll(".animate-pulse").length).toBe(3);
  });

  it("renders empty state when no segments and not loading", () => {
    const wrapper = mount(AITranscriptionPreview, {
      props: { segments: [], loading: false },
    });
    expect(wrapper.text()).toContain("La transcripción aparecerá aquí");
  });

  it("renders segments with speaker labels", () => {
    const wrapper = mount(AITranscriptionPreview, {
      props: {
        segments: [
          { speaker: "Speaker 1 (Médico)", text: "Hola, buenos días", start: 0, end: 2 },
          { speaker: "Speaker 2 (Paciente)", text: "Buenos días, doctor", start: 3, end: 5 },
        ],
        loading: false,
      },
    });
    expect(wrapper.text()).toContain("Speaker 1 (Médico)");
    expect(wrapper.text()).toContain("Hola, buenos días");
    expect(wrapper.text()).toContain("Speaker 2 (Paciente)");
    expect(wrapper.text()).toContain("Buenos días, doctor");
  });

  it("renders timestamps for each segment", () => {
    const wrapper = mount(AITranscriptionPreview, {
      props: {
        segments: [
          { speaker: "S1", text: "Test", start: 1.5, end: 3.2 },
        ],
        loading: false,
      },
    });
    expect(wrapper.text()).toContain("1.5s");
    expect(wrapper.text()).toContain("3.2s");
  });
});
