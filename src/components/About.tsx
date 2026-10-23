import { ArrowUp, ArrowUpRight } from 'lucide-react'

export function About() {
  return (
    <>
      <section className="about page-shell" id="about" aria-labelledby="about-title">
        <div className="about__aside"><span className="mono">04 / ABOUT</span><div className="about__planet" aria-hidden="true"><i /></div></div>
        <div className="about__content">
          <h2 id="about-title">你好，我是 QiXinia。</h2>
          <p className="about__lead">一个在代码与文字之间，<br />持续寻找答案的人。</p>
          <div className="about__columns">
            <p>我相信，真正有价值的创造，来自对世界持久的好奇。这里是我的数字花园，也是一份公开的学习笔记：记录那些尚未想明白的问题，以及一点点接近答案的过程。</p>
            <p>「深空手记」不追求更新频率，只希望每一篇文字都诚实、具体，并且值得未来的自己重读。谢谢你穿过星海，在此停留。</p>
          </div>
          <a className="text-link" href="https://github.com/QiXinia" target="_blank" rel="noreferrer">在 GitHub 上同行 <ArrowUpRight size={18} /></a>
        </div>
      </section>
      <footer className="site-footer page-shell">
        <div className="footer__brand"><strong>深空手记</strong><span>STAY CURIOUS. STAY HUMAN.</span></div>
        <p>© 2026 QIXINIA<br />用文字抵抗遗忘</p>
        <a className="back-to-top" href="#home" aria-label="返回页面顶部"><ArrowUp size={20} /><span>返回顶部</span></a>
      </footer>
    </>
  )
}
