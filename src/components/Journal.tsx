import { ArrowUpRight } from 'lucide-react'
import { articles, categories } from '@/data/articles'
import type { Article, Category } from '@/types/blog'
import { CosmicArtwork } from '@/components/CosmicArtwork'

interface JournalProps {
  activeCategory: '全部' | Category
  onCategoryChange: (category: '全部' | Category) => void
  onSelectArticle: (article: Article) => void
}

export function Journal({ activeCategory, onCategoryChange, onSelectArticle }: JournalProps) {
  const visibleArticles = activeCategory === '全部' ? articles : articles.filter((article) => article.category === activeCategory)
  const featured = visibleArticles.find((article) => article.featured) ?? visibleArticles[0]
  const remaining = visibleArticles.filter((article) => article.slug !== featured?.slug)

  return (
    <section className="journal page-shell" id="journal" aria-labelledby="journal-title">
      <div className="section-heading">
        <div><span className="section-heading__index mono">02 / JOURNAL</span><h2 id="journal-title">最近，从深空发回</h2></div>
        <p>一些思考，一些实践，<br />一些不愿被时间带走的瞬间。</p>
      </div>
      <div className="category-filter" role="group" aria-label="按分类筛选文章">
        {categories.map((category) => (
          <button type="button" key={category} className={activeCategory === category ? 'is-active' : ''} aria-pressed={activeCategory === category} onClick={() => onCategoryChange(category)}>
            {category}<span>{category === '全部' ? articles.length : articles.filter((article) => article.category === category).length}</span>
          </button>
        ))}
      </div>
      {featured && (
        <div className="article-collection" key={activeCategory}>
          <button className="featured-article" type="button" onClick={() => onSelectArticle(featured)} aria-label={`阅读：${featured.title}`}>
            <CosmicArtwork variant={featured.artwork} title={featured.title} />
            <div className="featured-article__copy">
              <div className="article-meta mono"><span>{featured.category}</span><span>{featured.date}</span></div>
              <h3>{featured.title}</h3>
              <span className="featured-article__english">{featured.englishTitle}</span>
              <p>{featured.excerpt}</p>
              <span className="read-link">阅读全文 <ArrowUpRight size={19} /></span>
            </div>
          </button>
          <div className="article-list">
            {remaining.map((article) => (
              <button className="article-row" type="button" key={article.slug} onClick={() => onSelectArticle(article)} aria-label={`阅读：${article.title}`}>
                <span className="article-row__number mono">{String(articles.indexOf(article) + 1).padStart(2, '0')}</span>
                <span className="article-row__main"><span className="article-meta mono"><span>{article.category}</span><span>{article.date}</span></span><strong>{article.title}</strong><span className="article-row__excerpt">{article.excerpt}</span></span>
                <span className="article-row__time mono">{article.readTime} MIN<ArrowUpRight size={18} /></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
