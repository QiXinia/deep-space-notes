import { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Asterisk, BookOpen } from 'lucide-react'
import { CosmicScene } from '@/components/CosmicScene'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Category } from '@/types/blog'

interface HeroProps {
  onSelectTopic: (category: Category) => void
}

const chapters = [
  { id: 'galaxy', label: '银河系', en: 'MILKY WAY' },
  { id: 'solar-system', label: '太阳系', en: 'SOLAR SYSTEM' },
  { id: 'saturn', label: '土星', en: 'SATURN' },
  { id: 'earth', label: '地球', en: 'EARTH' },
  { id: 'learning', label: '知识档案', en: 'THE ARCHIVE' },
]

const topics: { category: Category; index: string; description: string }[] = [
  { category: '创作', index: '01', description: '记录灵感如何成为作品' },
  { category: '技术', index: '02', description: '理解系统，也理解构建系统的人' },
  { category: '生活', index: '03', description: '在日常里保存感受与好奇' },
]

export function Hero({ onSelectTopic }: HeroProps) {
  const journeyRef = useRef<HTMLElement>(null)
  const [activeChapter, setActiveChapter] = useState(0)
  const reducedMotion = useReducedMotion()
  const onChapterChange = useCallback((chapter: number) => setActiveChapter(chapter), [])
  const goToChapter = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <section className="journey" id="home" ref={journeyRef} aria-labelledby="hero-title">
      <div className="journey__stage">
        <CosmicScene journeyRef={journeyRef} onChapterChange={onChapterChange} />
        <div className="journey__veil" />
        <div className="journey__hud page-shell">
          <span className="journey__hud-label mono">DEEP SPACE FLIGHT / 2026</span>
          <span className="journey__hud-status mono"><i /> LIVE RENDER</span>
        </div>
        <nav className="journey-nav" aria-label="宇宙航程章节">
          <span className="journey-nav__line"><i style={{ transform: `scaleY(${(activeChapter + 1) / chapters.length})` }} /></span>
          {chapters.map((chapter, index) => (
            <button
              type="button"
              key={chapter.id}
              className={index === activeChapter ? 'is-active' : ''}
              onClick={() => goToChapter(chapter.id)}
              aria-label={`前往${chapter.label}`}
              aria-current={index === activeChapter ? 'step' : undefined}
            >
              <span className="mono">0{index + 1}</span><i /><strong>{chapter.label}</strong>
            </button>
          ))}
        </nav>
        <div className="journey__chapter-count mono" aria-hidden="true">
          <span>0{activeChapter + 1}</span><i />05
        </div>
      </div>

      <div className="journey__chapters">
        <section className={`journey-chapter journey-chapter--galaxy ${activeChapter === 0 ? 'is-active' : ''}`} id="galaxy" aria-label="银河系启航">
          <div className="journey-chapter__inner page-shell">
            <div className="journey-copy">
              <div className="journey-copy__eyebrow"><Asterisk size={16} /><span>A PERSONAL ARCHIVE OF CURIOSITY</span></div>
              <h1 id="hero-title"><span>在宇宙深处</span><span>安放<em>思想</em></span></h1>
              <p>从千亿颗恒星之间出发，沿着光的方向，<br />寻找创作、技术与生活彼此相连的轨道。</p>
              <a className="primary-link" href="#solar-system"><span>启程，穿越星海</span><ArrowDown size={18} /></a>
            </div>
            <span className="journey-chapter__giant" aria-hidden="true">MILKY WAY</span>
            <div className="journey-chapter__foot mono"><span>SCROLL TO NAVIGATE</span><span>银河尺度 / 约 100,000 光年</span></div>
          </div>
        </section>

        <section className={`journey-chapter journey-chapter--solar ${activeChapter === 1 ? 'is-active' : ''}`} id="solar-system" aria-labelledby="solar-title">
          <div className="journey-chapter__inner page-shell">
            <div className="journey-copy">
              <span className="journey-copy__index mono">02 / SOLAR SYSTEM</span>
              <h2 id="solar-title">沿着光，抵达<br /><em>秩序的故乡</em></h2>
              <p>太阳居于中心，八大行星各自运行。<br />微小的世界，也能拥有精确而壮丽的秩序。</p>
              <dl className="journey-facts"><div><dt>恒星</dt><dd>01</dd></div><div><dt>行星</dt><dd>08</dd></div><div><dt>已知家园</dt><dd>01</dd></div></dl>
              <small className="journey-scale-note">行星大小与距离为艺术化压缩，非等比例星图。</small>
            </div>
          </div>
        </section>

        <section className={`journey-chapter journey-chapter--saturn ${activeChapter === 2 ? 'is-active' : ''}`} id="saturn" aria-labelledby="saturn-title">
          <div className="journey-chapter__inner page-shell">
            <div className="journey-copy">
              <span className="journey-copy__index mono">03 / SATURN FLYBY</span>
              <h2 id="saturn-title">每道光环，<br />都是时间写下的<br /><em>注脚</em></h2>
              <p>冰晶与岩石在引力中排列成环。<br />无数次碰撞与漫长岁月，最终成为看似静止的美。</p>
              <span className="journey-copy__annotation mono">THE RINGS / ICE · ROCK · TIME</span>
            </div>
          </div>
        </section>

        <section className={`journey-chapter journey-chapter--earth ${activeChapter === 3 ? 'is-active' : ''}`} id="earth" aria-labelledby="earth-title">
          <div className="journey-chapter__inner page-shell">
            <div className="journey-copy">
              <span className="journey-copy__index mono">04 / PALE BLUE HOME</span>
              <h2 id="earth-title">越过亿万星辰，<br />回到唯一的<em>家</em></h2>
              <p>云层、海洋与夜晚的灯光缓缓掠过。<br />所有我们读过的书、写下的代码、爱过的人，都在这里。</p>
              <a className="text-link" href="#learning">继续靠近，发现知识的引力 <ArrowRight size={18} /></a>
            </div>
          </div>
        </section>

        <section className={`journey-chapter journey-chapter--learning ${activeChapter === 4 ? 'is-active' : ''}`} id="learning" aria-labelledby="learning-title">
          <div className="journey-chapter__inner page-shell">
            <div className="journey-copy journey-copy--archive">
              <span className="journey-copy__index mono">05 / THE LEARNING ARCHIVE</span>
              <h2 id="learning-title">宇宙无垠，<br /><em>学习有迹可循</em></h2>
              <p>把遥远星球的震撼，收回一张书桌。<br />这里收藏持续学习的路径，也收藏抵达它们的过程。</p>
              <div className="journey-topics" aria-label="按主题阅读">
                {topics.map((topic) => (
                  <button type="button" key={topic.category} onClick={() => onSelectTopic(topic.category)}>
                    <span className="mono">{topic.index}</span><strong>{topic.category}</strong><small>{topic.description}</small><ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
              <a className="archive-link" href="#journal"><BookOpen size={18} /><span>进入全部学习手记</span><ArrowRight size={18} /></a>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
