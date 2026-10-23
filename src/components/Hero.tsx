import { ArrowDown, Asterisk } from 'lucide-react'
import { CosmicScene } from '@/components/CosmicScene'

export function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <CosmicScene />
      <div className="hero__veil" />
      <div className="hero__content page-shell">
        <div className="hero__eyebrow"><Asterisk size={16} /><span>A PERSONAL ARCHIVE OF CURIOSITY</span></div>
        <h1 id="hero-title"><span>在宇宙深处</span><span>安放<em>思想</em></span></h1>
        <p className="hero__intro">关于创作、技术与生活的长期记录。<br />在噪声之外，寻找值得留下的微光。</p>
        <a className="primary-link" href="#journal"><span>开始探索</span><ArrowDown size={18} /></a>
      </div>
      <div className="hero__coordinates mono" aria-hidden="true">
        <span>RA 23H 09M 16S</span><span>DEC −05° 32′ 12″</span>
      </div>
      <div className="hero__foot page-shell">
        <span className="hero__edition mono">VOL. 001 — 2026</span>
        <a href="#manifesto" className="scroll-cue"><i /><span>向下，进入深空</span></a>
        <span className="hero__signal mono"><i /> SIGNAL FOUND</span>
      </div>
    </section>
  )
}
