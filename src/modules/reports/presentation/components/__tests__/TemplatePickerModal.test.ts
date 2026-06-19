import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

// Mock useTemplateList
const mockTemplates = ref<any[]>([]);
const mockLoading = ref(false);
const mockError = ref<any>(null);
const mockFetchActive = vi.fn();

vi.mock("@/modules/reports/presentation/composables/useTemplateList", () => ({
  useTemplateList: () => ({
    templates: mockTemplates,
    loading: mockLoading,
    error: mockError,
    fetchActive: mockFetchActive,
  }),
}));

import TemplatePickerModal from "../TemplatePickerModal.vue";

beforeEach(() => {
  vi.clearAllMocks();
  mockTemplates.value = [];
  mockLoading.value = false;
  mockError.value = null;
});

function createWrapper(props: Record<string, any> = {}) {
  return mount(TemplatePickerModal, {
    props: {
      show: true,
      patientId: "42",
      ...props,
    },
    global: {
      stubs: {
        Modal: {
          template: '<div class="modal-stub"><button class="close-modal-btn" @click="$emit(\'close\')">Close</button><slot /></div>',
          props: ["show"],
          emits: ["close"],
        },
      },
    },
  });
}

describe("TemplatePickerModal", () => {
  it("renders skeleton loading state", async () => {
    mockLoading.value = true;
    const wrapper = createWrapper();
    await flushPromises();

    const skeletons = wrapper.findAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("renders error state with retry button", async () => {
    mockError.value = new Error("Failed");
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Error al cargar las plantillas");
    const retryBtn = wrapper.find("button:not(.close-modal-btn)");
    expect(retryBtn.exists()).toBe(true);
    expect(retryBtn.text()).toContain("Reintentar");
  });

  it("calls fetchActive on retry button click", async () => {
    mockError.value = new Error("Failed");
    const wrapper = createWrapper();
    await flushPromises();

    const retryBtn = wrapper.find("button:not(.close-modal-btn)");
    await retryBtn.trigger("click");
    expect(mockFetchActive).toHaveBeenCalled();
  });

  it("renders empty state when no templates", async () => {
    mockTemplates.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("No hay plantillas disponibles");
  });

  it("renders template list when templates loaded", async () => {
    mockTemplates.value = [
      { id: "1", name: "Informe Radiológico", isActive: true },
      { id: "2", name: "Informe de Laboratorio", isActive: true },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Informe Radiológico");
    expect(wrapper.text()).toContain("Informe de Laboratorio");
  });

  it("emits select with template on click", async () => {
    const template = { id: "7", name: "Informe Radiológico", isActive: true };
    mockTemplates.value = [template];
    const wrapper = createWrapper();
    await flushPromises();

    const templateItem = wrapper.find(".cursor-pointer");
    await templateItem.trigger("click");

    expect(wrapper.emitted("select")).toBeTruthy();
    expect(wrapper.emitted("select")![0]).toEqual([template]);
  });

  it("emits close on modal close", async () => {
    mockTemplates.value = [];
    const wrapper = createWrapper();
    await flushPromises();

    const closeBtn = wrapper.find(".close-modal-btn");
    await closeBtn.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("close")).toBeTruthy();
    expect(wrapper.emitted("close")!.length).toBe(1);
  });
});
