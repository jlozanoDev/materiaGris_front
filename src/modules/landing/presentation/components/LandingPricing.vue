<script setup lang="ts">
const emit = defineEmits<{
  selectPlan: [plan: string]
}>()
</script>

<template>
  <section id="precios" style="padding-block: clamp(48px, 8vw, 96px);">
    <div class="flex flex-col px-7 mx-auto" style="max-width: 1140px; gap: 56px;">
      <!-- Header -->
      <div class="text-center" style="max-width: 48ch; margin-inline: auto;">
        <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
          Planes
        </p>
        <h2 class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
          Escala con tus necesidades clínicas
        </h2>
        <p class="leading-relaxed mx-auto" style="font-size: 18px; line-height: 1.6; color: #6b6b7b; max-width: 60ch; margin-top: 12px;">
          Desde el consultorio individual hasta el hospital de alta complejidad. Todos los planes incluyen actualizaciones y soporte técnico.
        </p>
      </div>

      <!-- Pricing grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        <!-- Básico -->
        <div class="pricing-card">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Básico</h3>
          <p style="font-size: 14px; color: #6b6b7b;">Para profesionales independientes</p>
          <div class="price" style="font-size: 40px; font-weight: 800; letter-spacing: -0.03em; margin: 20px 0;">
            $0<small style="font-size: 16px; font-weight: 400; color: #6b6b7b;">/mes</small>
          </div>
          <ul>
            <li>Hasta 50 informes/mes</li>
            <li>Diagnóstico asistido básico</li>
            <li>Gestión de 100 pacientes</li>
            <li>Integración HCE estándar</li>
            <li>Soporte por email</li>
            <li class="missing">API FHIR completa</li>
            <li class="missing">Informes personalizados</li>
            <li class="missing">Auditoría avanzada</li>
          </ul>
          <button
            class="w-full py-3 font-semibold text-white transition flex items-center justify-center gap-2"
            style="padding: 12px 24px; border-radius: 10px; font-size: 15px; background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
            @click="emit('selectPlan', 'basico')"
          >
            Comenzar gratis
          </button>
        </div>

        <!-- Avanzado (highlighted) -->
        <div class="pricing-card pricing-highlight">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Avanzado</h3>
          <p style="font-size: 14px; color: #6b6b7b;">Para clínicas y consultorios grupales</p>
          <div class="price" style="font-size: 40px; font-weight: 800; letter-spacing: -0.03em; margin: 20px 0;">
            $149<small style="font-size: 16px; font-weight: 400; color: #6b6b7b;">/mes</small>
          </div>
          <ul>
            <li>Informes ilimitados</li>
            <li>Diagnóstico asistido avanzado</li>
            <li>Gestión de pacientes ilimitada</li>
            <li>Integración HCE completa</li>
            <li>Soporte prioritario 24/7</li>
            <li>API FHIR completa</li>
            <li>Informes personalizables</li>
            <li class="missing">Auditoría avanzada</li>
          </ul>
          <button
            class="w-full py-3 font-semibold text-white transition flex items-center justify-center gap-2"
            style="padding: 12px 24px; border-radius: 10px; font-size: 15px; background: #7c3aed; box-shadow: 0 1px 12px rgba(124, 58, 237, 0.30);"
            @click="emit('selectPlan', 'avanzado')"
          >
            Seleccionar plan
          </button>
        </div>

        <!-- Hospital -->
        <div class="pricing-card">
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Hospital</h3>
          <p style="font-size: 14px; color: #6b6b7b;">Para instituciones de alta complejidad</p>
          <div class="price" style="font-size: 40px; font-weight: 800; letter-spacing: -0.03em; margin: 20px 0;">
            <small style="font-size: 15px; font-weight: 400; color: #6b6b7b;">A medida</small>
          </div>
          <ul>
            <li>Todo lo de Avanzado</li>
            <li>Implementación on-premise</li>
            <li>Modelos entrenados con datos locales</li>
            <li>Integración con RIS/LIS propia</li>
            <li>Gestor de cuenta dedicado</li>
            <li>SLA 99.99%</li>
            <li>Auditoría y cumplimiento personalizado</li>
            <li>Capacitación del equipo</li>
          </ul>
          <button
            class="w-full py-3 font-semibold transition flex items-center justify-center gap-2"
            style="padding: 12px 24px; border-radius: 10px; font-size: 15px; background: transparent; color: #0b0817; border: 1px solid #e2e0e8;"
            @click="emit('selectPlan', 'hospital')"
          >
            Contactar ventas
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-card {
  background: #ffffff;
  border: 1px solid #e2e0e8;
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
}
.pricing-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  flex: 1;
}
.pricing-card ul li {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6b6b7b;
}
.pricing-card ul li::before {
  content: '';
  width: 18px;
  height: 18px;
  background: #10b981;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
  flex-shrink: 0;
}
.pricing-card ul li.missing {
  color: #e2e0e8;
}
.pricing-card ul li.missing::before {
  background: #e2e0e8;
}

.pricing-highlight {
  border: 1px solid #7c3aed;
  position: relative;
}
.pricing-highlight::before {
  content: 'Recomendado';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #7c3aed;
  color: #ffffff;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 14px;
  border-radius: 999px;
}
</style>
