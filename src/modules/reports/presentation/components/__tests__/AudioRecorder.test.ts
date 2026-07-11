import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AudioRecorder from "../AudioRecorder.vue";

function createWrapper(props: Record<string, any> = {}) {
  return mount(AudioRecorder, {
    props: {
      recordingState: "inactive",
      ...props,
    },
  });
}

describe("AudioRecorder", () => {
  it("renders start button when inactive", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Iniciar grabación");
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("emits start on button click", async () => {
    const wrapper = createWrapper();
    const btn = wrapper.find("button");
    await btn.trigger("click");
    expect(wrapper.emitted("start")).toHaveLength(1);
  });

  it("shows pause and stop buttons when recording", () => {
    const wrapper = createWrapper({ recordingState: "recording" });
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain("Pausar");
    expect(buttons[1].text()).toContain("Finalizar");
  });

  it("shows resume and stop buttons when paused", () => {
    const wrapper = createWrapper({ recordingState: "paused" });
    const buttons = wrapper.findAll("button");
    expect(buttons[0].text()).toContain("Continuar");
    expect(buttons[1].text()).toContain("Finalizar");
  });

  it("emits pause when recording and pause clicked", async () => {
    const wrapper = createWrapper({ recordingState: "recording" });
    const pauseBtn = wrapper.findAll("button")[0];
    await pauseBtn.trigger("click");
    expect(wrapper.emitted("pause")).toHaveLength(1);
  });

  it("emits resume when paused and resume clicked", async () => {
    const wrapper = createWrapper({ recordingState: "paused" });
    const resumeBtn = wrapper.findAll("button")[0];
    await resumeBtn.trigger("click");
    expect(wrapper.emitted("resume")).toHaveLength(1);
  });

  it("emits stop when stop clicked", async () => {
    const wrapper = createWrapper({ recordingState: "recording" });
    const stopBtn = wrapper.findAll("button")[1];
    await stopBtn.trigger("click");
    expect(wrapper.emitted("stop")).toHaveLength(1);
  });

  it("shows red recording indicator when recording", () => {
    const wrapper = createWrapper({ recordingState: "recording" });
    expect(wrapper.find(".bg-red-500").exists()).toBe(true);
  });

  it("shows timer in red when recording", () => {
    const wrapper = createWrapper({ recordingState: "recording" });
    const timer = wrapper.find(".text-3xl");
    expect(timer.classes()).toContain("text-red-500");
  });

  it("disables buttons when disabled prop is true", async () => {
    const wrapper = createWrapper({ recordingState: "recording", disabled: true });
    const buttons = wrapper.findAll("button");
    for (const btn of buttons) {
      expect(btn.attributes("disabled")).toBeDefined();
    }
  });

  it("does not emit events when disabled", async () => {
    const wrapper = createWrapper({ disabled: true });
    const btn = wrapper.find("button");
    await btn.trigger("click");
    expect(wrapper.emitted("start")).toBeUndefined();
  });
});
