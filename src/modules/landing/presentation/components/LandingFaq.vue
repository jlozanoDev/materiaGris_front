<script setup lang="ts">
const faqs = [
  {
    q: '¿Qué es MateriaGris?',
    a: 'MateriaGris es una plataforma de inteligencia artificial diseñada para generar informes médicos a partir de consultas grabadas. Transcribe, analiza y estructura automáticamente la información clínica.',
  },
  {
    q: '¿Cómo funciona la IA?',
    a: 'La IA transcribe y analiza la consulta en tiempo real, identificando datos clínicos relevantes y rellenando automáticamente el informe según la plantilla que hayas elegido. Tú solo revisas y firmas.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí, el procesamiento se realiza de forma local y no se comparte información con terceros. Tus datos clínicos permanecen bajo tu control en todo momento.',
  },
  {
    q: '¿Qué especialidades soporta?',
    a: 'Actualmente MateriaGris es compatible con múltiples especialidades médicas mediante plantillas personalizables que se adaptan a cada área clínica.',
  },
  {
    q: '¿Se integra con mi HCE?',
    a: 'Actualmente MateriaGris es una prueba de concepto. La integración con sistemas de historia clínica electrónica (HCE) está en desarrollo.',
  },
  {
    q: '¿Tiene costo?',
    a: 'No. Actualmente MateriaGris es una prueba de concepto gratuita. No hay planes de pago ni limitaciones por uso.',
  },
]
</script>

<template>
  <section style="padding-block: clamp(48px, 8vw, 96px);">
    <div class="flex flex-col px-7 mx-auto" style="max-width: 800px; gap: 48px;">
      <!-- Header -->
      <div class="text-center" style="max-width: 48ch; margin-inline: auto;">
        <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
          Preguntas frecuentes
        </p>
        <h2 class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
          Todo lo que necesitas saber
        </h2>
      </div>

      <!-- FAQ accordion -->
      <div class="flex flex-col" style="gap: 12px;">
        <details
          v-for="(faq, i) in faqs"
          :key="i"
          class="faq-item"
          style="border: 1px solid #e2e0e8; border-radius: 14px; overflow: hidden; transition: border-color 0.2s;"
        >
          <summary
            class="font-sans font-semibold tracking-tight"
            style="font-size: 16px; padding: 20px 24px; cursor: pointer; color: #0b0817; list-style: none; display: flex; justify-content: space-between; align-items: center;"
          >
            {{ faq.q }}
            <svg
              class="faq-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 20px; height: 20px; color: #7c3aed; flex-shrink: 0; transition: transform 0.2s;"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div style="padding: 0 24px 20px;">
            <p style="color: #6b6b7b; font-size: 15px; line-height: 1.7;">
              {{ faq.a }}
            </p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Remove default details marker */
.faq-item summary::-webkit-details-marker {
  display: none;
}
.faq-item summary::marker {
  display: none;
  content: '';
}

/* Rotate chevron when open */
.faq-item[open] .faq-chevron {
  transform: rotate(180deg);
}

/* Accent border on open */
.faq-item[open] {
  border-color: #7c3aed;
}
</style>
