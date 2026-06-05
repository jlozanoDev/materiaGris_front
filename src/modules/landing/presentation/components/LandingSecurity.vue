<script setup lang="ts">
import securityData from '@/assets/security-data.png'
import integrationFluid from '@/assets/integration-fluid.png'
import hceConnection from '@/assets/hce-connection.png'
</script>

<template>
  <section style="padding-block: clamp(48px, 8vw, 96px);">
    <div class="px-7 mx-auto" style="max-width: 1140px;">
      <div class="security-grid" style="align-items: center;">
        <!-- Left: Security cards -->
        <div class="flex flex-col" style="gap: 32px;">
          <div>
            <p class="font-mono font-medium uppercase tracking-wide" style="font-size: 12px; letter-spacing: 0.08em; color: #7c3aed; margin-bottom: 12px;">
              Seguridad e Integración
            </p>
            <h2 class="font-sans font-bold tracking-tight" style="font-size: clamp(30px, 3.6vw, 44px); line-height: 1.12; letter-spacing: -0.02em; color: #0b0817;">
              Diseñada para el entorno clínico real
            </h2>
            <p class="leading-relaxed" style="font-size: 18px; line-height: 1.6; color: #6b6b7b; max-width: 60ch; margin-top: 12px;">
              Cumplimiento normativo total, integración fluida con los sistemas que ya usas, y cifrado de extremo a extremo en todos los datos de paciente.
            </p>
          </div>

          <div class="security-subgrid" style="gap: 20px;">
            <!-- Security card 1 -->
            <div class="glass" style="padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
              <img :src="securityData" alt="Seguridad de Datos" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 4px;" />
              <div class="security-icon" style="width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 20px; color: #7c3aed; background: rgba(124,58,237,0.10);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 24px; height: 24px;">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 style="font-size: 17px; font-weight: 600;">Seguridad de Datos</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b;">Cifrado AES-256 en reposo y TLS 1.3 en tránsito. Cumplimiento HIPAA, GDPR y RGPD-ES. Auditoría continua.</p>
            </div>

            <!-- Security card 2 -->
            <div class="glass" style="padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
              <img :src="integrationFluid" alt="Integración Fluida" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 4px;" />
              <div class="security-icon" style="width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 20px; color: #06b6d4; background: rgba(6,182,212,0.08);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 24px; height: 24px;">
                  <path d="M4 4v16h16"></path>
                  <polyline points="20 10 12 18 8 14"></polyline>
                </svg>
              </div>
              <h3 style="font-size: 17px; font-weight: 600;">Integración Fluida</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b;">API REST FHIR-compatible. Conectores nativos para Historia Clínica Electrónica (HCE) y sistemas RIS/LIS.</p>
            </div>
          </div>
        </div>

        <!-- Right: HCE card -->
        <div class="glass-card flex flex-col items-center text-center" style="gap: 20px; padding: 40px 32px;">
          <img :src="hceConnection" alt="Conexión HCE" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 16px; margin-bottom: 4px;" />

          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-inline: auto;">
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="#7c3aed" stroke-width="1.5" fill="none"></rect>
            <path d="M24 18v12M18 24h12" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"></path>
            <path d="M4 28h40" stroke="rgba(255,255,255,0.10)" stroke-width="1"></path>
            <circle cx="14" cy="20" r="2" fill="#06b6d4" opacity="0.6"></circle>
            <circle cx="14" cy="26" r="2" fill="#7c3aed" opacity="0.4"></circle>
            <circle cx="14" cy="32" r="2" fill="#06b6d4" opacity="0.3"></circle>
            <rect x="32" y="18" width="8" height="14" rx="1" fill="rgba(124,58,237,0.10)" stroke="#7c3aed" stroke-width="0.8" opacity="0.5"></rect>
          </svg>

          <h3 style="font-size: 18px; font-weight: 600;">Conexión directa con tu HCE</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #6b6b7b; max-width: 36ch; margin-inline: auto;">
            MaterIA Gris se integra con los principales sistemas de historia clínica electrónica del mercado. Sin migraciones. Sin duplicación de datos.
          </p>

          <div class="flex flex-wrap gap-3 justify-center" style="margin-top: 4px;">
            <span class="tag" style="color: #9690a8; border: 1px solid rgba(255,255,255,0.10); font-size: 12px; font-family: 'JetBrains Mono', monospace; padding: 3px 12px; border-radius: 999px;">Epic</span>
            <span class="tag" style="color: #9690a8; border: 1px solid rgba(255,255,255,0.10); font-size: 12px; font-family: 'JetBrains Mono', monospace; padding: 3px 12px; border-radius: 999px;">Cerner</span>
            <span class="tag" style="color: #9690a8; border: 1px solid rgba(255,255,255,0.10); font-size: 12px; font-family: 'JetBrains Mono', monospace; padding: 3px 12px; border-radius: 999px;">InterSystems</span>
            <span class="tag" style="color: #9690a8; border: 1px solid rgba(255,255,255,0.10); font-size: 12px; font-family: 'JetBrains Mono', monospace; padding: 3px 12px; border-radius: 999px;">SAP Health</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.security-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 56px;
}
.security-subgrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
@media (max-width: 920px) {
  .security-grid,
  .security-subgrid {
    grid-template-columns: 1fr;
  }
}
</style>
