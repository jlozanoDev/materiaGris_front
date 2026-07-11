import html2pdf from 'html2pdf.js'

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const canvas = document.createElement('canvas')
canvas.width = 1
canvas.height = 1
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

const colorCache = new Map<string, string>()

function convertCssColor(cssColor: string): string {
  if (cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') return cssColor
  if (colorCache.has(cssColor)) return colorCache.get(cssColor)!

  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data

  if (a === 0) {
    // Browser did not paint anything: either unsupported color or truly transparent.
    colorCache.set(cssColor, cssColor)
    return cssColor
  }

  let result: string
  if (a === 255) {
    result = `rgb(${r}, ${g}, ${b})`
  } else {
    const alpha = a / 255
    result = `rgba(${Math.round(r / alpha)}, ${Math.round(g / alpha)}, ${Math.round(b / alpha)}, ${alpha.toFixed(3)})`
  }

  colorCache.set(cssColor, result)
  return result
}

function convertColorValue(value: string): string {
  if (!value.includes('oklch') && !value.includes('oklab') && !value.includes('lch(') && !value.includes('lab(') && !value.includes('color(')) {
    return value
  }

  return value
    .replace(/oklch\([^)]+\)/g, (match) => convertCssColor(match))
    .replace(/oklab\([^)]+\)/g, (match) => convertCssColor(match))
    .replace(/lch\([^)]+\)/g, (match) => convertCssColor(match))
    .replace(/lab\([^)]+\)/g, (match) => convertCssColor(match))
    .replace(/color\([^)]+\)/g, (match) => convertCssColor(match))
}

async function loadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

function resolveLogoUrl(src: string): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${apiBase}${src}`
  return `${apiBase}/${src}`
}

async function preparePdfElement(element: HTMLElement): Promise<{ element: HTMLElement; cleanup: () => void }> {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;height:100vh;visibility:hidden;'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument!
  const clone = element.cloneNode(true) as HTMLElement

  const origElements = [element, ...element.querySelectorAll<HTMLElement>('*')]
  const cloneElements = [clone, ...clone.querySelectorAll<HTMLElement>('*')]

  origElements.forEach((orig, i) => {
    const cl = cloneElements[i]
    const computed = getComputedStyle(orig)
    const styles: string[] = []

    for (let j = 0; j < computed.length; j++) {
      const prop = computed[j]
      const value = computed.getPropertyValue(prop)
      if (value && !prop.startsWith('-webkit-scrollbar') && !prop.startsWith('scrollbar-') && !prop.startsWith('-moz-')) {
        const converted = convertColorValue(value)
        styles.push(`${prop}: ${converted}`)
      }
    }

    cl.style.cssText = styles.join('; ')
  })

  // Pre-load images; remove broken ones so html2canvas does not fail
  const images = Array.from(clone.querySelectorAll<HTMLImageElement>('img'))
  await Promise.all(
    images.map(async (img) => {
      let src = img.getAttribute('src')
      if (!src) {
        img.remove()
        return
      }

      const resolvedSrc = resolveLogoUrl(src)

      if (resolvedSrc.startsWith('data:')) {
        img.setAttribute('src', resolvedSrc)
        return
      }

      let ok = await loadImage(resolvedSrc)

      if (!ok && resolvedSrc.includes('/logos/') && !resolvedSrc.includes('/storage/logos/')) {
        const fallbackSrc = resolvedSrc.replace('/logos/', '/storage/logos/')
        ok = await loadImage(fallbackSrc)
        if (ok) {
          img.setAttribute('src', fallbackSrc)
          return
        }
      }

      if (ok) {
        img.setAttribute('src', resolvedSrc)
      } else {
        console.warn('[generateReportPdf] removing broken image:', resolvedSrc)
        img.remove()
      }
    }),
  )

  // Reset off-screen positioning from the hidden export container
  clone.style.position = 'static'
  clone.style.left = 'auto'
  clone.style.top = 'auto'
  clone.style.zIndex = 'auto'
  clone.style.visibility = 'visible'
  clone.style.background = 'white'

  iframeDoc.body.style.margin = '0'
  iframeDoc.body.style.padding = '0'
  iframeDoc.body.appendChild(clone)

  return {
    element: clone,
    cleanup: () => {
      document.body.removeChild(iframe)
    },
  }
}

export async function generateReportPdf(element: HTMLElement): Promise<Blob> {
  const { element: exportEl, cleanup } = await preparePdfElement(element)

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: 'informe.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    const worker = html2pdf().set(opt as any).from(exportEl)
    const pdf = await worker.outputPdf('blob')
    return pdf as Blob
  } catch (err: any) {
    console.error('[generateReportPdf] html2pdf error:', err)
    console.error('[generateReportPdf] error type:', typeof err)
    console.error('[generateReportPdf] error string:', String(err))
    console.error('[generateReportPdf] error keys:', err ? Object.keys(err) : 'null')
    throw err
  } finally {
    cleanup()
  }
}
