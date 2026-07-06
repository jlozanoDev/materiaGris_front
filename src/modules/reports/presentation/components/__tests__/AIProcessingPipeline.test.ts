import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AIProcessingPipeline from "../AIProcessingPipeline.vue";

describe("AIProcessingPipeline", () => {
  it("renders four steps", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "idle", error: null },
    });
    const circles = wrapper.findAll(".rounded-full");
    expect(circles.length).toBe(4);
  });

  it("highlights recording step as current when state is recording", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "recording", error: null },
    });
    const circles = wrapper.findAll(".rounded-full");
    // First circle should be indigo (current), rest gray
    expect(circles[0].classes()).toContain("bg-indigo-600");
    expect(circles[1].classes()).toContain("bg-slate-200");
  });

  it("marks recording as completed when state is transcribing", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "transcribing", error: null },
    });
    const circles = wrapper.findAll(".rounded-full");
    expect(circles[0].classes()).toContain("bg-emerald-500");
    expect(circles[1].classes()).toContain("bg-indigo-600");
  });

  it("marks all as completed when state is done", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "done", error: null },
    });
    const circles = wrapper.findAll(".rounded-full");
    circles.forEach((c) => {
      expect(c.classes()).toContain("bg-emerald-500");
    });
  });

  it("shows error message when state is error", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "error", error: "API timeout" },
    });
    expect(wrapper.text()).toContain("API timeout");
    expect(wrapper.find(".bg-red-50").exists()).toBe(true);
  });

  it("does not show error section when error is null", () => {
    const wrapper = mount(AIProcessingPipeline, {
      props: { state: "error", error: null },
    });
    expect(wrapper.find(".bg-red-50").exists()).toBe(false);
  });
});
