import { useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { articles } from '@/data/articles'
import type { Article } from '@/types/blog'
import { CosmicArtwork } from '@/components/CosmicArtwork'

interface ArticleDialogProps {
  article: Article | null
  onClose: () => void
  onSelectArticle: (article: Article) => void
}

export function ArticleDialog({ article, onClose, onSelectArticle }: ArticleDialogProps) {
  const readerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (readerRef.current) readerRef.current.scrollTop = 0
  }, [article?.slug])

  const index = article ? articles.findIndex((item) => item.slug === article.slug) : -1
  const previous = index >= 0 ? articles[(index - 1 + articles.length) % articles.length] : null
  const next = index >= 0 ? articles[(index + 1) % articles.length] : null

  return (
    <Dialog.Root open={Boolean(article)} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay dialog-overlay--reader" />
        {article && <Dialog.Content ref={readerRef} className="article-reader" aria-describedby="article-excerpt">
          <div className="article-reader__toolbar"><span className="mono">DEEP SPACE NOTES / {article.category}</span><Dialog.Close asChild><button className="icon-button" type="button" aria-label="关闭文章"><X size={22} /></button></Dialog.Close></div>
          <article>
            <header className="article-reader__header">
              <div className="article-meta mono"><span>{article.category}</span><span>{article.date}</span><span>{article.readTime} MIN READ</span></div>
              <Dialog.Title>{article.title}</Dialog.Title>
              <span className="article-reader__english">{article.englishTitle}</span>
              <Dialog.Description id="article-excerpt">{article.excerpt}</Dialog.Description>
            </header>
            <CosmicArtwork variant={article.artwork} title={article.title} />
            <div className="article-reader__body">
              {article.content.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {article.quote && <blockquote>{article.quote}</blockquote>}
              {article.content.slice(2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="article-end"><i /><span className="mono">END OF TRANSMISSION</span><i /></div>
            </div>
            <nav className="article-pagination" aria-label="文章翻页">
              {previous && <button type="button" onClick={() => onSelectArticle(previous)}><ArrowLeft size={19} /><span><small>上一篇</small><strong>{previous.title}</strong></span></button>}
              {next && <button type="button" onClick={() => onSelectArticle(next)}><span><small>下一篇</small><strong>{next.title}</strong></span><ArrowRight size={19} /></button>}
            </nav>
          </article>
        </Dialog.Content>}
      </Dialog.Portal>
    </Dialog.Root>
  )
}
