<script setup lang="ts">
import { useRouter } from 'vue-router'
import LandingHeader from '@/modules/landing/presentation/components/LandingHeader.vue'
import LandingHero from '@/modules/landing/presentation/components/LandingHero.vue'
import LandingTagline from '@/modules/landing/presentation/components/LandingTagline.vue'
import LandingModules from '@/modules/landing/presentation/components/LandingModules.vue'
import LandingMetrics from '@/modules/landing/presentation/components/LandingMetrics.vue'
import LandingSecurity from '@/modules/landing/presentation/components/LandingSecurity.vue'
import LandingCta from '@/modules/landing/presentation/components/LandingCta.vue'
import LandingFooter from '@/modules/landing/presentation/components/LandingFooter.vue'
import LandingWorkflow from '@/modules/landing/presentation/components/LandingWorkflow.vue'
import LandingFaq from '@/modules/landing/presentation/components/LandingFaq.vue'

const router = useRouter()

const goLogin = () => router.push('/login')
const goDemo = () => {} // placeholder — integrar después
</script>

<template>
  <div class="w-full overflow-x-hidden font-sans bg-mg-bg">
    <LandingHeader @login="goLogin" @demo="goDemo" />
    <LandingHero @demo="goDemo" @view-platform="goLogin" />
    <LandingTagline />
    <LandingModules />
    <LandingMetrics />
    <LandingSecurity />
    <LandingWorkflow />
    <LandingFaq />
    <LandingCta />
    <LandingFooter />
  </div>
</template>
