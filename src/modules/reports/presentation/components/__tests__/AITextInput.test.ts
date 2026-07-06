import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AITextInput from "../AITextInput.vue";

function createWrapper(props: Record<string, any> = {}) {
  return mount(AITextInput, {
    props: {
      modelValue: "",
      ...props,
    },
  });
}

describe("AITextInput", () => {
  it("renders textarea with placeholder", () => {
    const wrapper = createWrapper();
    const textarea = wrapper.find("textarea");
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes("placeholder")).toContain("Pega aquí");
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = createWrapper();
    const textarea = wrapper.find("textarea");
    await textarea.setValue("Texto de prueba");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Texto de prueba"]);
  });

  it("process button is disabled when text is empty", () => {
    const wrapper = createWrapper({ modelValue: "" });
    const btn = wrapper.find("button");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.classes()).toContain("cursor-not-allowed");
  });

  it("process button is enabled when text is not empty", () => {
    const wrapper = createWrapper({ modelValue: "Algo de texto" });
    const btn = wrapper.find("button");
    expect(btn.attributes("disabled")).toBeUndefined();
    expect(btn.classes()).toContain("bg-indigo-600");
  });

  it("emits process on button click", async () => {
    const wrapper = createWrapper({ modelValue: "Texto" });
    const btn = wrapper.find("button");
    await btn.trigger("click");
    expect(wrapper.emitted("process")).toHaveLength(1);
  });

  it("shows loading state when loading prop is true", () => {
    const wrapper = createWrapper({ modelValue: "Texto", loading: true });
    expect(wrapper.text()).toContain("Analizando...");
    const btn = wrapper.find("button");
    expect(btn.find(".pi-spin").exists()).toBe(true);
  });

  it("disables textarea when disabled prop is true", () => {
    const wrapper = createWrapper({ disabled: true });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("disabled")).toBeDefined();
  });
});
