import { ArrowDownRight } from 'lucide-react'
import type { Category } from '@/types/blog'

interface ConstellationProps {
  onSelectTopic: (category: Category) => void
}

const topics: Array<{ category: Category; title: string; en: string; description: string }> = [
  { category: '创作', title: '创造与表达', en: 'CREATION', description: '灵感、写作与缓慢而坚定的长期主义。' },
  { category: '技术', title: '代码与系统', en: 'TECHNOLOGY', description: '不止于实现，也追问设计背后的秩序。' },
  { category: '生活', title: '日常与感受', en: 'LIFE', description: '在具体的片刻里，练习保持敏感。' },
]

export function Constellation({ onSelectTopic }: ConstellationProps) {
  return (
    <section className="constellation" id="constellation" aria-labelledby="constellation-title">
      <div className="page-shell">
        <div className="section-heading section-heading--light">
          <div><span className="section-heading__index mono">03 / CONSTELLATION</span><h2 id="constellation-title">此刻的引力</h2></div>
          <p>三个持续环绕的主题，<br />构成这片小小宇宙的运行轨迹。</p>
        </div>
        <div className="topic-orbits">
          {topics.map((topic, index) => (
            <button type="button" key={topic.category} onClick={() => onSelectTopic(topic.category)} aria-label={`查看${topic.category}分类文章`}>
              <span className="topic-orbits__visual" aria-hidden="true"><i /><b>{index + 1}</b></span>
              <span className="topic-orbits__copy"><small className="mono">{topic.en}</small><strong>{topic.title}</strong><span>{topic.description}</span></span>
              <ArrowDownRight size={24} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
