import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { articles } from '@/data/articles'
import type { Article } from '@/types/blog'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectArticle: (article: Article) => void
}

export function SearchDialog({ open, onOpenChange, onSelectArticle }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return articles
    return articles.filter((article) => [article.title, article.englishTitle, article.excerpt, article.category].join(' ').toLowerCase().includes(keyword))
  }, [query])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="search-dialog" aria-describedby="search-description">
          <div className="search-dialog__top"><Dialog.Title>搜索这片宇宙</Dialog.Title><Dialog.Close asChild><button className="icon-button" type="button" aria-label="关闭搜索"><X size={22} /></button></Dialog.Close></div>
          <Dialog.Description id="search-description">输入标题、分类或关键词，找到你想阅读的文字。</Dialog.Description>
          <label className="search-field"><Search size={22} /><span className="sr-only">搜索文章</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入关键词…" type="search" /></label>
          <div className="search-results" aria-live="polite">
            <p className="search-results__count mono">{results.length} 篇相关记录</p>
            {results.length ? results.map((article) => (
              <button type="button" key={article.slug} onClick={() => { onSelectArticle(article); onOpenChange(false) }}>
                <span><small className="mono">{article.category} · {article.date}</small><strong>{article.title}</strong><span>{article.excerpt}</span></span><ArrowUpRight size={20} />
              </button>
            )) : <div className="empty-state"><span className="orbit-glyph" aria-hidden="true"><i /></span><strong>这片星域暂时没有信号</strong><p>试试「创作」「代码」或「生活」。</p></div>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
