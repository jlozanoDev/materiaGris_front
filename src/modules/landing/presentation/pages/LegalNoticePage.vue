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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Aviso Legal</h1>
      <p class="text-sm mb-10" style="color: #9690a8;">Última actualización: junio 2026</p>

      <section class="space-y-8 text-sm leading-relaxed text-gray-700">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">1. Identificación del Titular</h2>
          <p>
            En cumplimiento con la Ley 25.326 de Protección de Datos Personales y la Ley 24.240
            de Defensa del Consumidor de España, se informa que el sitio web
            <strong class="text-gray-900">materiagris.com</strong> es operado por:
          </p>
          <ul class="mt-3 space-y-1 pl-5" style="list-style: disc;">
            <li><strong class="text-gray-900">Razón Social:</strong> MaterIA Gris S.A.S.</li>
            <li><strong class="text-gray-900">CUIT:</strong> 30-XXXXXXXX-X</li>
            <li><strong class="text-gray-900">Domicilio:</strong> [Dirección legal], Ciudad Autónoma de Buenos Aires, Argentina</li>
            <li><strong class="text-gray-900">Correo electrónico:</strong> legal@materiagris.com</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">2. Propiedad Intelectual</h2>
          <p>
            Todos los contenidos del sitio web —incluyendo textos, imágenes, logotipos, iconos,
            software, animaciones, bases de datos y código fuente— son propiedad de MaterIA Gris S.A.S.
            o cuentan con la correspondiente licencia de uso. Queda prohibida la reproducción,
            distribución, comunicación pública o transformación total o parcial sin autorización
            expresa y por escrito del titular.
          </p>
          <p class="mt-3">
            El nombre "MaterIA Gris", su logotipo y demás signos distintivos son marcas registradas
            de MaterIA Gris S.A.S. Su uso no autorizado constituye una infracción a la legislación
            vigente en materia de propiedad industrial e intelectual.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">3. Uso del Sitio</h2>
          <p>
            El usuario se compromete a utilizar el sitio web y sus servicios de conformidad con la
            ley, la moral, el orden público y las presentes condiciones. Queda prohibido cualquier
            uso fraudulento, ilícito o que pueda lesionar los derechos de terceros o de MaterIA Gris S.A.S.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">4. Exclusión de Responsabilidad</h2>
          <p>
            MaterIA Gris S.A.S. no se hace responsable por los daños o perjuicios derivados del uso
            indebido del sitio web, ni por la fiabilidad, exactitud o integridad de la información
            proporcionada a través del mismo, siempre que actúe dentro de los márgenes exigidos por
            la ley aplicable. El contenido de este sitio tiene fines informativos y no sustituye el
            asesoramiento profesional en ninguna disciplina.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">5. Legislación Aplicable</h2>
          <p>
            Las presentes condiciones se rigen por la legislación de España. Para
            cualquier controversia derivada de su interpretación o ejecución, las partes se someten
            a la jurisdicción de los tribunales ordinarios de Málaga.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">6. Contacto</h2>
          <p>
            Si tenés dudas sobre este aviso legal, podés escribirnos a
            <a href="mailto:legal@materiagris.com" class="underline" style="color: #7c3aed;">legal@materiagris.com</a>.
          </p>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
