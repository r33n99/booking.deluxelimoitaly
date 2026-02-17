export type TourBlockType = 'text' | 'quote' | 'video' | 'gallery'

interface BaseBlock {
  id: string | number
  type: TourBlockType
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  data?: {
    title?: string
    description?: string
  }
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  data: {
    description: string
    title?: string
  }
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  data: {
    url: string
    title?: string
  }
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery'
  data: {
    title?: string
    images: string[]
  }
}

export type TourBlock = TextBlock | QuoteBlock | VideoBlock | GalleryBlock

export interface TourAboutContentData {
  title: string
  blocks: TourBlock[]
}
