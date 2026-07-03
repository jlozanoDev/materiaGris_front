<script setup lang="ts">
import securityData from '@/assets/security-data.png'
import integrationFluid from '@/assets/integration-fluid.png'
import hceConnection from '@/assets/hce-connection.png'
</script>

<template>
  <section style="padding-block: clamp(48px, 8vw, 96px);">
    <div class="px-7 mx-auto" style="max-width: 1140px;">
      <div class="integration-grid" style="align-items: center;">
        <!-- Left: Cards -->
        <div class="flex flex-col" style="gap: 32px;">
          <div>
            <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
              Todo en una plataforma
            </p>
            <h2 class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
              Diseñada para el entorno clínico real
            </h2>
            <p class="leading-[1.625]" style="font-size: 18px; line-height: 1.6; color: #6b6b7b; max-width: 60ch; margin-top: 12px;">
              Pacientes, informes, plantillas y permisos — todo conectado en un solo lugar para que el médico se enfoque en lo que importa.
            </p>
          </div>

          <div class="integration-subgrid" style="gap: 20px;">
            <!-- Card 1: Dictado IA -->
            <div class="glass" style="padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
              <img :src="securityData" alt="Dictado y Transcripción con IA" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 4px;" />
              <div class="integration-icon" style="width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 8px; color: #7c3aed; background: rgba(124,58,237,0.10);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 24px; height: 24px;">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3 style="font-size: 17px; font-weight: 600;">Dictado y Transcripción con IA</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b;">Graba la consulta, la IA transcribe en tiempo real y extrae datos clínicos estructurados automáticamente.</p>
            </div>

            <!-- Card 2: Informes -->
            <div class="glass" style="padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
              <img :src="integrationFluid" alt="Informes Automatizados" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 4px;" />
              <div class="integration-icon" style="width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 8px; color: #06b6d4; background: rgba(6,182,212,0.08);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 24px; height: 24px;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <h3 style="font-size: 17px; font-weight: 600;">Informes Automatizados</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b;">La IA genera informes clínicos estructurados a partir del dictado. Revisión campo por campo antes de emitir.</p>
            </div>
          </div>
        </div>

        <!-- Right: Pacientes + Plantillas -->
        <div class="flex flex-col" style="gap: 20px;">
          <!-- Pacientes -->
          <div class="glass-card flex flex-col items-center text-center" style="gap: 16px; padding: 32px;">
            <img :src="hceConnection" alt="Pacientes y Directorio" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 16px; margin-bottom: 4px;" />
            <h3 style="font-size: 18px; font-weight: 600;">Pacientes y Directorio</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b; max-width: 36ch; margin-inline: auto;">
              Búsqueda rápida, creación sencilla y gestión completa de pacientes. Todo el historial en un solo perfil.
            </p>
          </div>

          <!-- Plantillas + Permisos -->
          <div class="glass-card flex flex-col items-center text-center" style="gap: 16px; padding: 32px;">
            <img :src="securityData" alt="Plantillas y Permisos" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 16px; margin-bottom: 4px;" />
            <h3 style="font-size: 18px; font-weight: 600;">Plantillas y Permisos</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b; max-width: 36ch; margin-inline: auto;">
              Plantillas personalizables por especialidad y control de acceso por rol — administrador y médico con permisos granulares.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.integration-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 56px;
}
.integration-subgrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
@media (max-width: 920px) {
  .integration-grid,
  .integration-subgrid {
    grid-template-columns: 1fr;
  }
}
</style>
