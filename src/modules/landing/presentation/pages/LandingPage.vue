<script setup lang="ts">
import { useRouter } from 'vue-router'
import LandingHeader from '@/modules/landing/presentation/components/LandingHeader.vue'
import LandingHero from '@/modules/landing/presentation/components/LandingHero.vue'
import LandingTagline from '@/modules/landing/presentation/components/LandingTagline.vue'
import LandingModules from '@/modules/landing/presentation/components/LandingModules.vue'
import LandingMetrics from '@/modules/landing/presentation/components/LandingMetrics.vue'
import LandingSecurity from '@/modules/landing/presentation/components/LandingSecurity.vue'
import LandingPricing from '@/modules/landing/presentation/components/LandingPricing.vue'
import LandingCta from '@/modules/landing/presentation/components/LandingCta.vue'
import LandingFooter from '@/modules/landing/presentation/components/LandingFooter.vue'

const router = useRouter()

const goLogin = () => router.push('/login')
const goDemo = () => {} // placeholder — integrar después
const goSales = () => {} // placeholder
const selectPlan = (plan: string) => {} // placeholder
</script>

<template>
  <div class="w-full overflow-x-hidden font-sans bg-mg-bg">
    <LandingHeader @login="goLogin" @demo="goDemo" />
    <LandingHero @demo="goDemo" @view-platform="goLogin" />
    <LandingTagline />
    <LandingModules />
    <LandingMetrics />
    <LandingSecurity />
    <LandingPricing @select-plan="selectPlan" />
    <LandingCta @demo="goDemo" @sales="goSales" />
    <LandingFooter />
  </div>
</template>
