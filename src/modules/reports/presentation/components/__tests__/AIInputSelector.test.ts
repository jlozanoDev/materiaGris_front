import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AIInputSelector from "../AIInputSelector.vue";

function createWrapper(props: Record<string, any> = {}) {
  return mount(AIInputSelector, {
    props: {
      modelValue: "record",
      ...props,
    },
  });
}

describe("AIInputSelector", () => {
  it("renders three mode buttons", () => {
    const wrapper = createWrapper();
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(3);
    expect(buttons[0].text()).toContain("Grabar consulta");
    expect(buttons[1].text()).toContain("Subir audio");
    expect(buttons[2].text()).toContain("Pegar transcripción");
  });

  it("highlights the active mode", () => {
    const wrapper = createWrapper({ modelValue: "paste" });
    const buttons = wrapper.findAll("button");
    expect(buttons[2].classes()).toContain("bg-white");
    expect(buttons[0].classes()).not.toContain("bg-white");
  });

  it("emits update:modelValue when clicking a different mode", async () => {
    const wrapper = createWrapper({ modelValue: "record" });
    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["upload"]);
  });

  it("does not emit when disabled", async () => {
    const wrapper = createWrapper({ modelValue: "record", disabled: true });
    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(buttons[0].classes()).toContain("opacity-50");
  });
});
