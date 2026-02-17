import type { ComponentPublicInstance, Ref } from 'vue'

export type PdfTab = 'documents' | 'receipts'
export type PdfType = 'doc' | 'rec'
export type PdfFormat = 'a4' | 'a6'

export interface DocumentItem {
  id: number | string
  name: string
  created_at: string
  location: string
  establishment: string
  date: string
  people: string | number | null
  [key: string]: unknown
}

export interface ReceiptItem {
  id: number | string
  name: string
  type_of_service?: string
  pickup?: string
  dropoff?: string | null
  date_start?: string
  total?: string | number | null
  amount?: string | number | null
  payment_code?: string
  car?: string | number | null
  number_of_passengers?: string | number | null
  [key: string]: unknown
}

export interface CarItem {
  class_id: number | string
  class_name: string
  [key: string]: unknown
}

export interface ApiResponse<T> {
  data: T
}

export interface Html2PdfOptions {
  margin: number
  filename: string
  html2canvas: {
    scale: number
  }
  jsPDF: {
    unit: string
    format: PdfFormat
    orientation: 'portrait' | 'landscape'
  }
}

export interface Html2PdfWorker {
  from: (source: HTMLElement | string) => Html2PdfWorker
  set: (options: Html2PdfOptions) => Html2PdfWorker
  save: () => Promise<void>
}

export type Html2PdfFactory = () => Html2PdfWorker

export interface WindowWithHtml2Pdf extends Window {
  html2pdf?: Html2PdfFactory
}

export type ElementRefs = Ref<(HTMLElement | Element | ComponentPublicInstance | null)[]>
