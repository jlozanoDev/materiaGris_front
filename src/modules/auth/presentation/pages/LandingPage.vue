<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/materiagris.svg'
import doctor from '@/assets/doctor.png'
import {
  Brain, FileText, Activity, ChevronRight, CheckCircle2, Phone
} from 'lucide-vue-next'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const router = useRouter()

onMounted(() => {
  // Simple reveal animations
  gsap.from('.reveal-up', {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.reveal-up',
      start: 'top 85%'
    }
  })
})
</script>

<template>
<div class="relative w-full overflow-x-hidden font-sans bg-[#F8F9FC]">
  
   <!-- DARK SECTION (HERO) -->
   <section class="relative pt-8 pb-56 overflow-hidden" style="background: radial-gradient(800px 500px at 12% 18%, rgba(111,66,193,0.45), transparent 15%), radial-gradient(700px 500px at 90% 80%, rgba(6,182,212,0.10), transparent 20%), linear-gradient(180deg,#2b0b4f,#0b0420 85%);">
    <!-- Synapses background SVG -->
    <svg class="absolute top-[20%] left-0 w-[40%] h-[40%] z-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 250 Q 200 250, 400 250" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 5" class="animate-[pulse_3s_infinite]" />
      <path d="M0 100 Q 250 200, 400 250" stroke="#a855f7" stroke-width="2" class="animate-[pulse_4s_infinite]" style="animation-delay: 0.2s" />
      <path d="M0 400 Q 250 300, 400 250" stroke="#38bdf8" stroke-width="2" class="animate-[pulse_2.5s_infinite]" style="animation-delay: 0.4s" />
      <circle cx="50" cy="250" r="10" fill="#38bdf8" />
      <circle cx="150" cy="100" r="15" fill="#a855f7" />
      <circle cx="100" cy="400" r="12" fill="#38bdf8" />
    </svg>

    <!-- Background glow circles -->
    <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Header -->
      <header class="relative z-50 flex items-center justify-between px-6 md:px-12 py-4">
         <div class="flex items-center gap-3 bg-transparent rounded-2xl px-2 py-1">
            <div class="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
               <img :src="logo" class="h-8 w-8 object-contain" />
            </div>
            <div>
               <h1 class="text-white font-extrabold text-lg leading-none">MaterIA Gris</h1>
               <p class="text-slate-300 text-[10px] uppercase tracking-wider">Plataforma clínica</p>
            </div>
         </div>
         <div class="flex items-center gap-4">
            <a href="mailto:soporte@materiagris.com" class="text-white text-sm font-medium hover:text-cyan-300 transition">Soporte</a>
            <button class="bg-gradient-to-r from-[#6B46F6] to-[#4F39F6] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-[0_8px_30px_rgba(79,57,246,0.45)] hover:opacity-95 transition" @click="router.push('/login')">
               Iniciar sesión
            </button>
         </div>
      </header>

    <!-- Hero Content -->
    <div class="relative z-10 max-w-5xl mx-auto mt-16 text-center flex flex-col items-center">
      
      <!-- Central Graphic -->
         <div class="relative w-full h-[420px] flex justify-center items-center mb-8">
            <!-- Glowing Brain Circle -->
            <div class="relative w-80 h-80 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-transparent z-20 shadow-[0_0_120px_rgba(79,57,246,0.25),inset_0_0_60px_rgba(79,57,246,0.12)]">
               <!-- Inner glow ring -->
               <div class="absolute inset-[-28px] rounded-full border-2 border-purple-500/30 animate-[ping_3s_infinite]"></div>
          
               <div class="w-40 h-40 rounded-full bg-gradient-to-br from-[#6B46F6] to-[#4F39F6] flex items-center justify-center shadow-[0_0_30px_rgba(79,57,246,0.6)] relative z-10">
                  <img :src="logo" class="w-28 h-28 object-contain filter drop-shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
               </div>
          
               <div class="absolute -bottom-6 bg-transparent px-4 py-1 z-20">
                   <h2 class="text-white text-2xl font-extrabold tracking-widest">MaterIA Gris</h2>
               </div>
            </div>

            <!-- Doctor Avatar -->
            <img :src="doctor" class="absolute right-6 top-6 md:right-16 md:top-10 lg:right-24 lg:top-12 h-96 z-30 drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] pointer-events-none transform rotate-3" />
         </div>

      <!-- Hero Text -->
         <h2 class="text-4xl md:text-6xl font-extrabold text-white max-w-4xl leading-tight mb-8 tracking-tight landing-hero-title">
            MaterIA Gris: Tu socio de IA para una práctica clínica optimizada y humana
         </h2>

      <!-- CTA Buttons -->
         <div class="flex flex-wrap justify-center items-center gap-4 mb-8">
            <button class="bg-gradient-to-r from-[#6B46F6] to-[#4F39F6] text-white px-10 py-3.5 rounded-full text-base font-extrabold shadow-[0_18px_50px_rgba(79,57,246,0.45)] transition-transform hover:-translate-y-0.5" @click="router.push('/login')">
               Acceder a mi cuenta
            </button>
            <button class="bg-white text-[#110A2E] px-8 py-3.5 rounded-full text-base font-semibold hover:bg-slate-100 transition-all border border-white/30">
               Solicitar demo
            </button>
         </div>

      <!-- Tags -->
      <div class="flex flex-wrap items-center justify-center gap-3">
        <span class="bg-white text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">Datos cifrados</span>
        <span class="bg-white text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">Conforme RGPD</span>
        <span class="bg-white text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">100% en la nube</span>
      </div>
    </div>
  </section>

  <!-- OVERLAPPING WHITE CARDS SECTION -->
  <section class="relative z-20 max-w-7xl mx-auto px-6 -mt-40 mb-20">
    <!-- Red Blood Cells Background Simulation -->
    <div class="absolute inset-0 pointer-events-none z-[-1]">
       <div class="absolute top-[20%] left-[-5%] w-24 h-24 bg-red-600/60 rounded-full blur-[3px] shadow-[inset_-10px_-10px_20px_rgba(153,27,27,0.8)] transform rotate-12"></div>
       <div class="absolute top-[40%] right-[-2%] w-32 h-32 bg-red-600/60 rounded-full blur-[4px] shadow-[inset_-15px_-15px_30px_rgba(153,27,27,0.8)] transform -rotate-45"></div>
       <div class="absolute bottom-[-10%] left-[20%] w-20 h-20 bg-red-600/60 rounded-full blur-[2px] shadow-[inset_-8px_-8px_15px_rgba(153,27,27,0.8)] transform rotate-45"></div>
       <div class="absolute bottom-[10%] right-[30%] w-16 h-16 bg-red-600/50 rounded-full blur-[2px] shadow-[inset_-8px_-8px_15px_rgba(153,27,27,0.8)]"></div>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="reveal-up bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 h-[450px] flex flex-col">
        <div class="flex items-center gap-2 mb-4 text-cyan-600">
          <FileText class="w-5 h-5" />
          <h3 class="font-bold text-lg text-slate-800">Generación de Informes Inteligentes.</h3>
        </div>
        <div class="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
           <!-- Placeholder wireframe -->
           <div class="p-5 space-y-4 opacity-80">
             <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
               <div class="w-8 h-8 rounded-full bg-slate-200"></div>
               <div class="flex-1">
                 <div class="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                 <div class="h-2 bg-slate-200 rounded w-1/4"></div>
               </div>
             </div>
             <div class="h-3 bg-slate-200 rounded w-full"></div>
             <div class="h-3 bg-slate-200 rounded w-5/6"></div>
             <div class="h-3 bg-slate-200 rounded w-4/6"></div>
             <div class="h-24 bg-white border border-slate-200 rounded-xl mt-4 flex items-center justify-center text-slate-300">
               Contenido Analizado por IA
             </div>
           </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="reveal-up bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 h-[450px] flex flex-col transform md:translate-y-8">
        <div class="flex items-center gap-2 mb-4 text-[#4F39F6]">
          <Activity class="w-5 h-5" />
          <h3 class="font-bold text-lg text-slate-800">Diagnóstico Asistido y Análisis de Datos.</h3>
        </div>
        <div class="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
           <div class="p-5 grid grid-cols-2 gap-3 h-full">
              <div class="h-20 bg-white border border-slate-200 rounded-xl flex items-end justify-center pb-3 shadow-sm relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-t from-purple-100 to-transparent opacity-50"></div>
                <div class="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div class="h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <div class="text-center">
                  <div class="text-xs text-slate-400">Precisión</div>
                  <div class="text-xl font-bold text-[#4F39F6]">98.5%</div>
                </div>
              </div>
              <div class="col-span-2 h-32 bg-white border border-slate-200 rounded-xl mt-2 shadow-sm flex items-end p-2 overflow-hidden">
                 <!-- Line Chart Mock -->
                 <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                   <path d="M0,35 L10,25 L20,30 L30,10 L40,20 L50,15 L60,25 L70,5 L80,15 L90,10 L100,20" fill="none" stroke="#4F39F6" stroke-width="2.5"/>
                   <path d="M0,35 L10,25 L20,30 L30,10 L40,20 L50,15 L60,25 L70,5 L80,15 L90,10 L100,20 L100,40 L0,40 Z" fill="url(#gradient)" opacity="0.2"/>
                   <defs>
                     <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stop-color="#4F39F6"/>
                       <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                     </linearGradient>
                   </defs>
                 </svg>
              </div>
           </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="reveal-up bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 h-[450px] flex flex-col transform md:translate-y-16">
        <div class="flex items-center gap-2 mb-4 text-blue-600">
          <Brain class="w-5 h-5" />
          <h3 class="font-bold text-lg text-slate-800">Gestión Integral del Paciente.</h3>
        </div>
        <div class="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner">
           <div class="p-5 h-full">
              <!-- KPI Box -->
              <div class="h-28 bg-gradient-to-br from-[#4F39F6] to-cyan-500 rounded-2xl mb-4 text-white p-5 flex flex-col justify-center shadow-md relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                 <div class="text-sm font-medium opacity-90 mb-1">Total Pacientes Hoy</div>
                 <div class="text-4xl font-black">104</div>
              </div>
              <!-- List items -->
              <div class="space-y-3">
                 <div class="h-12 bg-white border border-slate-200 rounded-xl flex items-center px-4 gap-4 shadow-sm">
                   <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs">A.M.</div>
                   <div class="flex-1">
                     <div class="h-2 w-24 bg-slate-300 rounded mb-1.5"></div>
                     <div class="h-2 w-16 bg-slate-200 rounded"></div>
                   </div>
                 </div>
                 <div class="h-12 bg-white border border-slate-200 rounded-xl flex items-center px-4 gap-4 shadow-sm">
                   <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs">C.R.</div>
                   <div class="flex-1">
                     <div class="h-2 w-20 bg-slate-300 rounded mb-1.5"></div>
                     <div class="h-2 w-12 bg-slate-200 rounded"></div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LIGHT SECTION (FEATURES, MODULES, PRICING) -->
  <section class="bg-[#F8F9FC] pb-24 px-6 md:px-12 relative z-10">
     <div class="max-w-7xl mx-auto pt-10">
        
        <!-- MODULES & SECURITY ROW -->
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-24 items-center">
           <!-- LEFT: Stats & Graphic -->
           <div class="relative flex flex-col items-center">
              
              <!-- 3D Stack Graphic Simulation -->
              <div class="relative w-full h-[500px] flex justify-center items-center">
                 <div class="absolute w-72 h-72 bg-cyan-200/50 rounded-full blur-[80px]"></div>
                 
                 <!-- Layer 1 -->
                 <div class="absolute w-[300px] sm:w-[380px] h-48 bg-gradient-to-br from-white to-[#f8fafc] border-2 border-cyan-200 rounded-[2rem] shadow-2xl flex items-center justify-center" style="transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg) translateY(80px) translateX(40px);">
                    <div class="absolute inset-0 bg-cyan-400/5 rounded-[2rem]"></div>
                 </div>
                 <!-- Layer 2 -->
                 <div class="absolute w-[300px] sm:w-[380px] h-48 bg-gradient-to-br from-white to-[#f8fafc] border-2 border-purple-200 rounded-[2rem] shadow-2xl flex items-center justify-center" style="transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg);">
                    <div class="absolute inset-0 bg-purple-400/5 rounded-[2rem]"></div>
                 </div>
                 <!-- Layer 3 -->
                 <div class="absolute w-[300px] sm:w-[380px] h-48 bg-gradient-to-br from-white to-[#f8fafc] border-2 border-blue-200 rounded-[2rem] shadow-2xl flex items-center justify-center" style="transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg) translateY(-80px) translateX(-40px);">
                    <div class="absolute inset-0 bg-blue-400/5 rounded-[2rem]"></div>
                 </div>
                 
                 <!-- Central Spine/DNA Vector Replacement -->
                 <div class="absolute z-10 w-16 h-80 flex flex-col justify-between items-center py-4">
                    <!-- Rings -->
                    <div class="w-16 h-6 border-4 border-cyan-400 rounded-full absolute top-[10%] shadow-[0_0_15px_#38bdf8]"></div>
                    <div class="w-16 h-6 border-4 border-purple-400 rounded-full absolute top-[40%] shadow-[0_0_15px_#a855f7]"></div>
                    <div class="w-16 h-6 border-4 border-blue-400 rounded-full absolute top-[70%] shadow-[0_0_15px_#3b82f6]"></div>
                    <!-- Core line -->
                    <div class="w-2 h-full bg-gradient-to-b from-cyan-400 via-purple-400 to-blue-400 rounded-full opacity-80 shadow-[0_0_20px_#a855f7]"></div>
                 </div>

                 <!-- Bento Stats Cards around the graphic -->
                 <div class="absolute top-[5%] left-[0%] bg-white rounded-2xl p-5 shadow-xl border border-slate-100 flex flex-col gap-1 z-20 w-44">
                    <div class="w-8 h-8 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center mb-2"><FileText class="w-4 h-4"/></div>
                    <span class="text-3xl font-black text-slate-800">+2.400</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Informes Generados</span>
                 </div>
                 
                 <div class="absolute top-[20%] right-[-5%] bg-white rounded-2xl p-5 shadow-xl border border-slate-100 flex flex-col gap-1 z-20 w-40 text-center">
                    <span class="text-3xl font-black text-slate-800">98%</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Precisión Clínica</span>
                 </div>

                 <div class="absolute bottom-[20%] left-[-5%] bg-white rounded-2xl p-5 shadow-xl border border-slate-100 flex flex-col gap-1 z-20 w-40 text-center">
                    <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2"><Activity class="w-4 h-4"/></div>
                    <span class="text-3xl font-black text-slate-800">&lt; 60s/</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Por informe</span>
                 </div>

                 <div class="absolute bottom-[5%] right-[0%] bg-white rounded-2xl p-5 shadow-xl border border-slate-100 flex flex-col gap-1 z-20 w-44 text-center">
                    <div class="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2"><Brain class="w-4 h-4"/></div>
                    <span class="text-3xl font-black text-slate-800">150+</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profesionales Activos</span>
                 </div>
              </div>
           </div>

           <!-- RIGHT: Modules -->
           <div class="flex flex-col gap-16">
              
              <!-- Módulos Adicionales -->
              <div>
                 <h2 class="text-3xl font-bold text-slate-800 mb-8 text-center">Módulos Adicionales</h2>
                 <div class="flex gap-4 items-center justify-center">
                    <button class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-[#4F39F6] transition-colors"><ChevronRight class="w-5 h-5 rotate-180"/></button>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                       <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
                          <div class="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-500"><Phone class="w-7 h-7"/></div>
                          <span class="text-sm font-bold text-slate-700 leading-tight">Telemedicina Integrada</span>
                       </div>
                       <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
                          <div class="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500"><Activity class="w-7 h-7"/></div>
                          <span class="text-sm font-bold text-slate-700 leading-tight">Seguimiento de Wearables</span>
                       </div>
                       <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
                          <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><FileText class="w-7 h-7"/></div>
                          <span class="text-sm font-bold text-slate-700 leading-tight">Facturación Automatizada</span>
                       </div>
                    </div>

                    <button class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-[#4F39F6] transition-colors"><ChevronRight class="w-5 h-5"/></button>
                 </div>

                 <!-- Social Proof Box -->
                 <div class="mt-8 bg-gradient-to-r from-[#5B42F6] to-[#7358F8] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 text-white shadow-lg">
                    <div class="flex -space-x-3">
                       <img src="https://i.pravatar.cc/100?img=1" class="w-12 h-12 rounded-full border-2 border-[#6B46C1]" />
                       <img src="https://i.pravatar.cc/100?img=2" class="w-12 h-12 rounded-full border-2 border-[#6B46C1]" />
                       <img src="https://i.pravatar.cc/100?img=3" class="w-12 h-12 rounded-full border-2 border-[#6B46C1]" />
                    </div>
                    <div>
                       <div class="text-xs text-purple-200 font-medium uppercase tracking-wider mb-1">Caso de estudio</div>
                       <div class="text-base font-bold">Hospital General X ahorró 25% en costos operativos</div>
                    </div>
                 </div>
              </div>

              <!-- Integración y Seguridad -->
              <div>
                 <h2 class="text-3xl font-bold text-slate-800 mb-8 text-center">Integración y Seguridad</h2>
                 <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
                       <img src="https://api.iconify.design/flat-color-icons:lock.svg" class="w-16 h-16" />
                       <span class="text-sm font-bold text-slate-700 leading-tight">Integración fluida con sistemas existentes</span>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
                       <img src="https://api.iconify.design/flat-color-icons:data-protection.svg" class="w-16 h-16" />
                       <span class="text-sm font-bold text-slate-700 leading-tight">Integración con Firewalls de última generación</span>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
                       <img src="https://api.iconify.design/flat-color-icons:database.svg" class="w-16 h-16" />
                       <span class="text-sm font-bold text-slate-700 leading-tight">Seguridad de Datos y Conectividad centralizada</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- PRICING SECTION -->
        <div class="max-w-6xl mx-auto mt-32">
           <div class="bg-[#110A2E] rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
              <!-- Glow -->
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-[#4F39F6]/30 blur-[100px] rounded-full pointer-events-none"></div>

              <h2 class="text-3xl md:text-4xl font-bold text-white mb-3 relative z-10">Iniciar acción & pricing model</h2>
              <p class="text-slate-400 text-sm mb-12 relative z-10">Precios diseñados para adaptarse a tu práctica médica</p>
              
              <div class="grid md:grid-cols-3 gap-6 text-left relative z-10">
                 <!-- Básico -->
                 <div class="bg-white rounded-[2rem] p-8 flex flex-col">
                    <h3 class="text-2xl font-bold text-slate-800 mb-6 text-center border-b border-slate-100 pb-4">Básico</h3>
                    <ul class="space-y-4 mb-8 flex-1">
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> 100 informes al mes</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Soporte por email</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Gestión de pacientes</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium opacity-50"><CheckCircle2 class="w-5 h-5 text-slate-300 shrink-0"/> Múltiples agendas</li>
                    </ul>
                    <button class="w-full py-3.5 bg-[#4F39F6] text-white rounded-xl font-bold text-sm hover:bg-[#3d2ae6] transition shadow-md">Elegir plan Básico</button>
                 </div>

                 <!-- Avanzado -->
                 <div class="bg-white rounded-[2rem] p-8 flex flex-col shadow-[0_0_40px_rgba(79,57,246,0.4)] transform md:-translate-y-6 border-2 border-[#4F39F6]">
                    <div class="bg-[#4F39F6] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-full w-max mx-auto -mt-12 mb-4 shadow-sm">El Más Elegido</div>
                    <h3 class="text-2xl font-bold text-slate-800 mb-6 text-center border-b border-slate-100 pb-4">Avanzado</h3>
                    <ul class="space-y-4 mb-8 flex-1">
                       <li class="flex gap-3 text-sm text-slate-800 font-bold"><CheckCircle2 class="w-5 h-5 text-[#4F39F6] shrink-0"/> Informes IA Ilimitados</li>
                       <li class="flex gap-3 text-sm text-slate-800 font-bold"><CheckCircle2 class="w-5 h-5 text-[#4F39F6] shrink-0"/> Diagnóstico Asistido</li>
                       <li class="flex gap-3 text-sm text-slate-800 font-bold"><CheckCircle2 class="w-5 h-5 text-[#4F39F6] shrink-0"/> Soporte Prioritario 24/7</li>
                       <li class="flex gap-3 text-sm text-slate-800 font-bold"><CheckCircle2 class="w-5 h-5 text-[#4F39F6] shrink-0"/> Múltiples agendas</li>
                    </ul>
                    <button class="w-full py-4 bg-[#4F39F6] text-white rounded-xl font-bold text-base hover:bg-[#3d2ae6] transition shadow-lg">Comenzar Prueba</button>
                 </div>

                 <!-- Hospital -->
                 <div class="bg-white rounded-[2rem] p-8 flex flex-col">
                    <h3 class="text-2xl font-bold text-slate-800 mb-6 text-center border-b border-slate-100 pb-4">Hospital</h3>
                    <ul class="space-y-4 mb-8 flex-1">
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Usuarios Ilimitados</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Integración API / HL7</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Servidor Dedicado</li>
                       <li class="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-cyan-500 shrink-0"/> Onboarding personalizado</li>
                    </ul>
                    <button class="w-full py-3.5 bg-white text-[#4F39F6] border-2 border-[#4F39F6] rounded-xl font-bold text-sm hover:bg-slate-50 transition">Contactar Ventas</button>
                 </div>
              </div>
           </div>
        </div>

     </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-white pt-16 pb-8 px-6 md:px-12 border-t border-slate-100">
     <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
        <div class="max-w-sm">
           <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                 <img :src="logo" class="h-6 w-6 object-contain" />
              </div>
              <span class="font-bold text-xl text-slate-800">MaterIA Gris</span>
           </div>
           <p class="text-slate-500 text-sm leading-relaxed">Tu socio de IA para una práctica clínica optimizada y humana. Construido para revolucionar la salud.</p>
        </div>
        
        <div class="flex flex-wrap gap-16">
           <div>
              <h4 class="font-bold text-slate-800 mb-6 text-sm">Soluciones</h4>
              <ul class="space-y-3 text-sm text-slate-500 font-medium">
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Informes IA</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Gestión de pacientes</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Telemedicina</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Precios</a></li>
              </ul>
           </div>
           <div>
              <h4 class="font-bold text-slate-800 mb-6 text-sm">Empresa</h4>
              <ul class="space-y-3 text-sm text-slate-500 font-medium">
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Sobre Nosotros</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Blog Médico</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Contacto</a></li>
              </ul>
           </div>
           <div>
              <h4 class="font-bold text-slate-800 mb-6 text-sm">Legal</h4>
              <ul class="space-y-3 text-sm text-slate-500 font-medium">
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Términos de uso</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Privacidad</a></li>
                 <li><a href="#" class="hover:text-[#4F39F6] transition">Cookies</a></li>
              </ul>
           </div>
        </div>
     </div>
     <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-400">
        <span>© {{ new Date().getFullYear() }} MaterIA Gris. Todos los derechos reservados.</span>
        <div class="flex gap-6">
           <a href="#" class="hover:text-[#4F39F6] transition">Twitter / X</a>
           <a href="#" class="hover:text-[#4F39F6] transition">LinkedIn</a>
           <a href="#" class="hover:text-[#4F39F6] transition">Instagram</a>
        </div>
     </div>
  </footer>

</div>
</template>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
