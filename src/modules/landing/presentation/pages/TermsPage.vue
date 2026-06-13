<script setup lang="ts">
import { useRouter } from 'vue-router'
import LandingHeader from '@/modules/landing/presentation/components/LandingHeader.vue'
import LandingFooter from '@/modules/landing/presentation/components/LandingFooter.vue'

const router = useRouter()

const goLogin = () => router.push('/login')
const goDemo = () => {} // placeholder
</script>

<template>
  <div class="w-full overflow-x-hidden font-sans bg-white">
    <LandingHeader @login="goLogin" @demo="goDemo" />

    <main class="px-7 pt-32 pb-20 mx-auto" style="max-width: 800px;">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
      <p class="text-sm mb-10" style="color: #9690a8;">Última actualización: junio 2026</p>

      <section class="space-y-8 text-sm leading-[1.625] text-gray-700">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">1. Aceptación</h2>
          <p>
            Al acceder, registrarte o utilizar la plataforma de MaterIA Gris (en adelante, la
            "Plataforma"), aceptás los presentes Términos y Condiciones en su totalidad. Si no
            estás de acuerdo con alguna parte, no debes usar la Plataforma.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">2. Definiciones</h2>
          <ul class="space-y-1 pl-5" style="list-style: disc;">
            <li><strong class="text-gray-900">Plataforma:</strong> sistema web MaterIA Gris, incluyendo todos sus módulos, funcionalidades y contenido.</li>
            <li><strong class="text-gray-900">Usuario:</strong> persona física o jurídica que se registra y utiliza la Plataforma.</li>
            <li><strong class="text-gray-900">Paciente:</strong> persona cuyos datos de salud son procesados a través de la Plataforma.</li>
            <li><strong class="text-gray-900">Institución:</strong> entidad de salud que contrata los servicios de MaterIA Gris.</li>
            <li><strong class="text-gray-900">Datos de Salud:</strong> información relativa a la salud física o mental de una persona, incluyendo historias clínicas, diagnósticos, tratamientos y estudios.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">3. Registro y Cuenta</h2>
          <p>
            Para usar la Plataforma debes registrarte proporcionando información veraz, completa
            y actualizada. Sos responsable de mantener la confidencialidad de tus credenciales
            de acceso. Notificanos inmediatamente ante cualquier uso no autorizado de tu cuenta.
            MaterIA Gris se reserva el derecho de rechazar o cancelar registros sin expresión de causa.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">4. Uso de la Plataforma</h2>
          <p>Como Usuario, te comprometés a:</p>
          <ul class="mt-3 space-y-1 pl-5" style="list-style: disc;">
            <li>Usar la Plataforma exclusivamente para fines profesionales lícitos.</li>
            <li>No compartir credenciales de acceso con terceros no autorizados.</li>
            <li>No intentar acceder a datos de otros usuarios, instituciones o pacientes sin autorización.</li>
            <li>No realizar ingeniería inversa, descompilar o alterar el software de la Plataforma.</li>
            <li>Cumplir con todas las leyes y regulaciones aplicables, incluyendo las de protección de datos y secreto profesional.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">5. Responsabilidad sobre Datos de Salud</h2>
          <p>
            El Usuario y/o la Institución contratante son los responsables del tratamiento de los
            datos de salud ingresados en la Plataforma. MaterIA Gris actúa como encargado del
            tratamiento y procesa dichos datos exclusivamente según las instrucciones documentadas
            del responsable. El Usuario garantiza que cuenta con todas las autorizaciones y
            consentimientos necesarios para el tratamiento de datos de salud a través de la Plataforma.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">6. Propiedad Intelectual</h2>
          <p>
            La Plataforma, su código fuente, diseño, logotipos, nombre comercial y contenido
            original son propiedad exclusiva de MaterIA Gris S.A.S. Se concede al Usuario una
            licencia limitada, no exclusiva e intransferible para usar la Plataforma durante el
            período de vigencia del servicio contratado. Esta licencia no incluye el derecho a
            modificar, distribuir o crear obras derivadas.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">7. Confidencialidad</h2>
          <p>
            Ambas partes se comprometen a mantener la confidencialidad de toda información
            intercambiada en el marco del servicio, incluyendo datos de salud, información
            comercial, algoritmos y cualquier dato técnico o de negocio. Esta obligación
            subsiste incluso después de finalizada la relación contractual.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">8. Limitación de Responsabilidad</h2>
          <p>
            MaterIA Gris no será responsable por daños indirectos, pérdida de datos, lucro cesante
            o interrupción del negocio derivados del uso o la imposibilidad de uso de la Plataforma.
            La responsabilidad total de MaterIA Gris se limita al monto pagado por el servicio
            durante los 12 meses anteriores al reclamo. Esta limitación no aplica en casos de dolo
            o culpa grave.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">9. Garantías</h2>
          <p>
            La Plataforma se proporciona "tal cual" y "según disponibilidad". MaterIA Gris no
            garantiza que el servicio sea ininterrumpido, libre de errores o que cumpla con
            requisitos específicos del Usuario. Sin embargo, nos comprometemos a mantener un
            nivel de servicio acorde a los estándares de la industria y a corregir defectos
            reportados dentro de plazos razonables.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">10. Vigencia y Terminación</h2>
          <p>
            Estos términos rigen mientras el Usuario mantenga una cuenta activa. Cualquiera de
            las partes puede terminar la relación contractual mediante preaviso escrito de 30 días.
            MaterIA Gris puede suspender o cancelar el acceso inmediatamente ante el incumplimiento
            de estos términos. Al terminar, el Usuario debe dejar de usar la Plataforma y MaterIA
            Gris eliminará los datos conforme a la política de retención acordada.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">11. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos Términos se rigen por la legislación de España. Toda controversia
            se somete a los tribunales ordinarios de Málaga, con
            exclusión de cualquier otro fuero que pudiera corresponder.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">12. Contacto</h2>
          <p>
            Para consultas sobre estos términos, escribinos a
            <a href="mailto:legal@materiagris.com" class="underline" style="color: #7c3aed;">legal@materiagris.com</a>.
          </p>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
