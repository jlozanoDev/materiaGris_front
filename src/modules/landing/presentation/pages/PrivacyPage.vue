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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
      <p class="text-sm mb-10" style="color: #9690a8;">Última actualización: junio 2026</p>

      <section class="space-y-8 text-sm leading-[1.625] text-gray-700">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">1. Responsable del Tratamiento</h2>
          <p>
            MaterIA Gris S.A.S. (en adelante, "MaterIA Gris"), con CUIT 30-XXXXXXXX-X y domicilio
            en [Dirección legal], CABA, Argentina, actúa como responsable del tratamiento de los
            datos personales recabados a través del sitio web y la plataforma
            <strong class="text-gray-900">materiagris.com</strong>.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">2. Datos que Recopilamos</h2>
          <p>Podemos recopilar las siguientes categorías de datos personales:</p>
          <ul class="mt-3 space-y-1 pl-5" style="list-style: disc;">
            <li><strong class="text-gray-900">Datos de identificación:</strong> nombre, apellido, DNI, CUIT/CUIL.</li>
            <li><strong class="text-gray-900">Datos de contacto:</strong> correo electrónico, teléfono, dirección profesional.</li>
            <li><strong class="text-gray-900">Datos profesionales:</strong> matrícula profesional, especialidad, institución de salud donde ejerce.</li>
            <li><strong class="text-gray-900">Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, duración de la sesión.</li>
            <li><strong class="text-gray-900">Datos de uso:</strong> interacciones con la plataforma, funcionalidades utilizadas, métricas de desempeño.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">3. Finalidades del Tratamiento</h2>
          <p>Tus datos serán tratados para los siguientes fines:</p>
          <ul class="mt-3 space-y-1 pl-5" style="list-style: disc;">
            <li>Gestionar la cuenta de usuario y proporcionar acceso a la plataforma.</li>
            <li>Brindar soporte técnico y atención al cliente.</li>
            <li>Mejorar la plataforma y personalizar la experiencia de uso.</li>
            <li>Enviar comunicaciones comerciales, previo consentimiento expreso.</li>
            <li>Cumplir con obligaciones legales y regulatorias aplicables al ámbito de la salud.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">4. Base Legal</h2>
          <p>
            El tratamiento de tus datos se fundamenta en: (a) la ejecución del contrato de servicios
            aceptado al registrarte; (b) tu consentimiento expreso para fines específicos como
            comunicaciones comerciales; (c) el cumplimiento de obligaciones legales aplicables;
            y (d) el interés legítimo de mejorar nuestros servicios.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">5. Confidencialidad de Datos de Salud</h2>
          <p>
            MaterIA Gris trata datos de salud exclusivamente como encargado del tratamiento por
            cuenta de las instituciones de salud clientes. Todo dato clínico está seudonimizado,
            cifrado en tránsito y en reposo, y se procesa bajo estrictas medidas de seguridad
            técnicas y organizativas. En ningún caso utilizamos datos de salud para fines distintos
            a la prestación del servicio contratado.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">6. Conservación de los Datos</h2>
          <p>
            Conservamos tus datos personales mientras mantengas una cuenta activa en la plataforma.
            Una vez finalizada la relación contractual, los datos se bloquean durante los plazos
            de prescripción legal aplicables y luego se eliminan de forma segura. Los datos de salud
            se eliminan conforme a la política de retención acordada con cada institución cliente.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">7. Tus Derechos</h2>
          <p>
            De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina y el
            Reglamento General de Protección de Datos (UE) 2016/679 cuando corresponda, podés
            ejercer los siguientes derechos:
          </p>
          <ul class="mt-3 space-y-1 pl-5" style="list-style: disc;">
            <li><strong class="text-gray-900">Acceso:</strong> conocer qué datos tuyos tenemos y cómo los usamos.</li>
            <li><strong class="text-gray-900">Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
            <li><strong class="text-gray-900">Cancelación:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong class="text-gray-900">Oposición:</strong> oponerte al tratamiento para fines comerciales.</li>
            <li><strong class="text-gray-900">Portabilidad:</strong> recibir tus datos en un formato estructurado (cuando aplique).</li>
          </ul>
          <p class="mt-3">
            Para ejercer estos derechos, escribinos a
            <a href="mailto:privacidad@materiagris.com" class="underline" style="color: #7c3aed;">privacidad@materiagris.com</a>
            adjuntando una copia de tu documento de identidad. Responderemos en un plazo máximo
            de 10 días hábiles.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">8. Transferencia de Datos</h2>
          <p>
            No cedemos tus datos personales a terceros sin tu consentimiento, salvo obligación
            legal o cuando sea necesario para la prestación del servicio (proveedores de
            infraestructura cloud, procesadores de pago, etc.). En estos casos, aseguramos que
            el encargado de tratamiento cumpla con niveles de protección equivalentes.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">9. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso
            no autorizado, pérdida, alteración o divulgación: cifrado TLS 1.3 en tránsito,
            cifrado AES-256 en reposo, autenticación multifactor, auditoría de accesos y
            capacitación periódica del personal.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">10. Modificaciones</h2>
          <p>
            Esta política puede actualizarse periódicamente. Notificaremos cambios significativos
            a través de la plataforma o por correo electrónico. Te recomendamos revisar esta
            página regularmente.
          </p>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
