import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { animate, stagger } from 'animejs'

export interface SlideShowOptions {
  totalSlides: number
  initialSlide?: number
  autoAdvance?: number // ms interval, 0 = disabled
}

export function useSlideShow(options: SlideShowOptions) {
  const { totalSlides, initialSlide = 0, autoAdvance = 0 } = options

  const currentSlide = ref(initialSlide)
  const direction = ref<'next' | 'prev'>('next')
  const isAnimating = ref(false)
  const reducedMotion = ref(false)

  let autoTimer: ReturnType<typeof setInterval> | null = null
  let slideContainerRef: Ref<HTMLElement | null> = ref(null)

  const progress = computed(() => (currentSlide.value + 1) / totalSlides)
  const slideLabel = computed(() => `${currentSlide.value + 1} / ${totalSlides}`)
  const isFirst = computed(() => currentSlide.value === 0)
  const isLast = computed(() => currentSlide.value === totalSlides - 1)

  function checkReducedMotion() {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function goNext() {
    if (isAnimating.value || currentSlide.value >= totalSlides - 1) return
    direction.value = 'next'
    transition(currentSlide.value, currentSlide.value + 1)
  }

  function goPrev() {
    if (isAnimating.value || currentSlide.value <= 0) return
    direction.value = 'prev'
    transition(currentSlide.value, currentSlide.value - 1)
  }

  function goTo(index: number) {
    if (isAnimating.value || index === currentSlide.value) return
    if (index < 0 || index >= totalSlides) return
    direction.value = index > currentSlide.value ? 'next' : 'prev'
    transition(currentSlide.value, index)
  }

  function getSlideEl(index: number): HTMLElement | null {
    return document.querySelector(`[data-slide-index="${index}"]`)
  }

  function transition(from: number, to: number) {
    isAnimating.value = true

    const outgoing = getSlideEl(from)
    const incoming = getSlideEl(to)

    if (!outgoing || !incoming) {
      currentSlide.value = to
      isAnimating.value = false
      return
    }

    // Show incoming slide before starting animation
    incoming.classList.add('slide-panel--active')

    if (reducedMotion.value) {
      // Simple crossfade for reduced motion
      animate(outgoing, {
        opacity: [1, 0],
        duration: 200,
        easing: 'linear',
        complete: () => {
          outgoing.classList.remove('slide-panel--active')
          animate(incoming, {
            opacity: [0, 1],
            duration: 200,
            easing: 'linear',
            complete: () => {
              currentSlide.value = to
              isAnimating.value = false
              staggerContent(to)
            }
          })
        }
      })
      return
    }

    // 3D card-flip transition
    const dir = direction.value === 'next' ? 1 : -1

    // Prepare incoming from opposite rotation (hidden behind outgoing)
    incoming.style.transform = `rotateY(${90 * dir}deg) scale(0.85)`
    incoming.style.opacity = '0'

    animate(outgoing, {
      rotateY: [0, -90 * dir],
      scale: [1, 0.85],
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInOutCubic',
      complete: () => {
        outgoing.classList.remove('slide-panel--active')

        animate(incoming, {
          rotateY: [90 * dir, 0],
          scale: [0.85, 1],
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutCubic',
          complete: () => {
            incoming.style.transform = ''
            currentSlide.value = to
            isAnimating.value = false
            staggerContent(to)
          }
        })
      }
    })
  }

  function staggerContent(slideIndex: number) {
    const slide = getSlideEl(slideIndex)
    if (!slide) return
    const items = slide.querySelectorAll('[data-stagger]')
    if (!items.length) return

    if (reducedMotion.value) {
      items.forEach((el) => {
        (el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'none'
      })
      return
    }

    animate(items, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(80, { start: 100 }),
      easing: 'easeOutCubic'
    })
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      goNext()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      goPrev()
    }
  }

  function handleClick(e: MouseEvent) {
    const x = e.clientX
    const half = window.innerWidth / 2
    if (x > half) {
      goNext()
    } else {
      goPrev()
    }
  }

  function startAutoAdvance() {
    if (autoAdvance <= 0) return
    autoTimer = setInterval(() => {
      if (isLast.value) {
        goTo(0)
      } else {
        goNext()
      }
    }, autoAdvance)
  }

  function stopAutoAdvance() {
    if (autoTimer) {
      clearInterval(autoTimer)
      autoTimer = null
    }
  }

  // Handle reduced motion changes
  let reducedMotionMq: MediaQueryList | null = null
  function onReducedMotionChange(e: MediaQueryListEvent) {
    reducedMotion.value = e.matches
  }

  onMounted(() => {
    checkReducedMotion()
    reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionMq.addEventListener('change', onReducedMotionChange)

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('click', handleClick)

    if (autoAdvance > 0) startAutoAdvance()

    // Stagger content on initial slide
    setTimeout(() => staggerContent(currentSlide.value), 100)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('click', handleClick)
    stopAutoAdvance()
    if (reducedMotionMq) {
      reducedMotionMq.removeEventListener('change', onReducedMotionChange)
    }
  })

  return {
    currentSlide,
    totalSlides,
    direction,
    progress,
    slideLabel,
    isFirst,
    isLast,
    isAnimating,
    goNext,
    goPrev,
    goTo,
    staggerContent,
  }
}
