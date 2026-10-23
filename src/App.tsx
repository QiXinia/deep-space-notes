import { useState } from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Manifesto } from '@/components/Manifesto'
import { Journal } from '@/components/Journal'
import { Constellation } from '@/components/Constellation'
import { About } from '@/components/About'
import { SearchDialog } from '@/components/SearchDialog'
import { ArticleDialog } from '@/components/ArticleDialog'
import type { Article, Category } from '@/types/blog'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import './App.css'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [activeCategory, setActiveCategory] = useState<'全部' | Category>('全部')
  const reducedMotion = useReducedMotion()

  const selectTopic = (category: Category) => {
    setActiveCategory(category)
    document.getElementById('journal')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="site-frame">
      <a className="skip-link" href="#journal">跳到文章内容</a>
      <Header onSearch={() => setSearchOpen(true)} />
      <main>
        <Hero onSelectTopic={selectTopic} />
        <Manifesto />
        <Journal activeCategory={activeCategory} onCategoryChange={setActiveCategory} onSelectArticle={setSelectedArticle} />
        <Constellation onSelectTopic={selectTopic} />
        <About />
      </main>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSelectArticle={setSelectedArticle} />
      <ArticleDialog article={selectedArticle} onClose={() => setSelectedArticle(null)} onSelectArticle={setSelectedArticle} />
    </div>
  )
}
