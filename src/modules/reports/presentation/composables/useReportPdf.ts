import html2pdf from 'html2pdf.js'

export async function generateReportPdf(element: HTMLElement): Promise<Blob> {
  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: 'informe.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  // Use the Promise-based API correctly
  const worker = html2pdf().set(opt as any).from(element)
  const pdf = await worker.outputPdf('blob')
  return pdf as Blob
}
