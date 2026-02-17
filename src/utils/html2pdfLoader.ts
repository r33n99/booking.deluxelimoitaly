/**
 * Утилита для динамической загрузки html2pdf.js
 * Загружает библиотеку только при необходимости, что улучшает производительность начальной загрузки
 */

export interface Html2PdfFactory {
  (): Html2PdfWorker
}

export interface Html2PdfWorker {
  from: (source: HTMLElement | string) => Html2PdfWorker
  set: (options: Html2PdfOptions) => Html2PdfWorker
  save: () => Promise<void>
}

export interface Html2PdfOptions {
  margin: number
  filename: string
  html2canvas: {
    scale: number
  }
  jsPDF: {
    unit: string
    format: 'a4' | 'a6'
    orientation: 'portrait' | 'landscape'
  }
}

interface WindowWithHtml2Pdf extends Window {
  html2pdf?: Html2PdfFactory
}

let html2pdfPromise: Promise<Html2PdfFactory> | null = null
let isLoaded = false

/**
 * Динамически загружает html2pdf.js с CDN
 * @returns Promise с функцией html2pdf
 */
function loadHtml2Pdf(): Promise<Html2PdfFactory> {
  if (isLoaded && (window as WindowWithHtml2Pdf).html2pdf) {
    return Promise.resolve((window as WindowWithHtml2Pdf).html2pdf!)
  }

  if (html2pdfPromise) {
    return html2pdfPromise
  }

  html2pdfPromise = new Promise((resolve, reject) => {
    // Проверяем, не загружен ли уже скрипт
    if ((window as WindowWithHtml2Pdf).html2pdf) {
      isLoaded = true
      resolve((window as WindowWithHtml2Pdf).html2pdf!)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      isLoaded = true
      const html2pdf = (window as WindowWithHtml2Pdf).html2pdf
      if (html2pdf) {
        resolve(html2pdf)
      } else {
        reject(new Error('html2pdf не был загружен в window объект'))
      }
    }

    script.onerror = () => {
      html2pdfPromise = null
      reject(new Error('Не удалось загрузить html2pdf.js'))
    }

    document.head.appendChild(script)
  })

  return html2pdfPromise
}

/**
 * Получает экземпляр html2pdf, загружая его при необходимости
 * @returns Promise с функцией html2pdf
 */
export async function getHtml2Pdf(): Promise<Html2PdfFactory> {
  return loadHtml2Pdf()
}

/**
 * Генерирует PDF из HTML элемента
 * @param element - HTML элемент для конвертации
 * @param options - Опции для генерации PDF
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options: Html2PdfOptions
): Promise<void> {
  const html2pdfFactory = await getHtml2Pdf()
  const htmlContent = element.innerHTML

  await html2pdfFactory().from(htmlContent).set(options).save()
}
