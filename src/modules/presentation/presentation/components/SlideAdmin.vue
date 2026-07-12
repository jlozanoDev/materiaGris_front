<script setup lang="ts">
const profiles = [
  {
    icon: 'user-md',
    title: 'Médico',
    desc: 'Usuario principal. Accede al dashboard, gestiona pacientes, crea y firma informes. Visibilidad completa de su práctica clínica.',
    color: '#06b6d4'
  },
  {
    icon: 'shield',
    title: 'Administrador',
    desc: 'Gestiona usuarios del sistema, roles, permisos y configuración de la clínica. Control total sobre quién accede a qué.',
    color: '#7c3aed'
  },
  {
    icon: 'user',
    title: 'Recepcionista',
    desc: 'Da de alta pacientes, gestiona la agenda y apoya la administración del consultorio. Acceso limitado a datos clínicos.',
    color: '#10b981'
  }
]

const permissions = [
  'admin.user.view', 'admin.user.create',
  'admin.role.view', 'admin.role.update',
  'report.view', 'report.create',
  'patient.view', 'patient.create'
]
</script>

<template>
  <section class="slide">
    <div class="slide-content">
      <span class="slide-label" data-stagger>Control de acceso</span>

      <h2 class="slide-title" data-stagger>
        Seguridad granular<br>
        <span class="title-highlight">con RBAC</span>
      </h2>

      <p class="slide-subtitle" data-stagger>
        Tres perfiles de usuario con permisos granulares. Cada funcionalidad y ruta 
        protegida por un sistema de control de acceso basado en roles.
      </p>

      <div class="profiles-grid" data-stagger>
        <div
          v-for="profile in profiles"
          :key="profile.title"
          class="profile-card"
          :style="{ '--accent': profile.color }"
        >
          <div class="profile-icon" :style="{ background: `${profile.color}15`, color: profile.color }">
            <svg v-if="profile.icon === 'user-md'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <svg v-else-if="profile.icon === 'shield'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <svg v-else-if="profile.icon === 'user'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 class="profile-title">{{ profile.title }}</h3>
          <p class="profile-desc">{{ profile.desc }}</p>
        </div>
      </div>

      <div class="perms-bar" data-stagger>
        <span class="perms-label">Permisos:</span>
        <div class="perm-badges">
          <span v-for="perm in permissions" :key="perm" class="perm-badge">{{ perm }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.slide-content {
  max-width: 860px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.slide-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7c3aed;
}

.slide-title {
  font-size: clamp(30px, 3.6vw, 44px);
  font-weight: 700;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.title-highlight {
  color: #a78bfa;
}

.slide-subtitle {
  font-size: 15px;
  line-height: 1.65;
  color: #9690a8;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.profile-card {
  padding: 28px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.3s ease;
}
.profile-card:hover {
  transform: translateY(-4px);
}

.profile-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.profile-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.profile-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #9690a8;
}

.perms-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perms-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.perm-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perm-badge {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(124,58,237,0.1);
  color: #a78bfa;
  border: 1px solid rgba(124,58,237,0.15);
}

@media (max-width: 900px) {
  .profiles-grid { grid-template-columns: 1fr; }
  .slide { padding: 40px 24px; }
}
</style>
