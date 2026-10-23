export type Category = '创作' | '技术' | '生活'

export interface Article {
  slug: string
  title: string
  englishTitle: string
  excerpt: string
  category: Category
  date: string
  readTime: number
  featured?: boolean
  artwork: 'orbit' | 'eclipse' | 'wave' | 'prism' | 'dust' | 'tide'
  content: string[]
  quote?: string
}
