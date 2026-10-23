import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, Search, X, ArrowUpRight } from 'lucide-react'

interface HeaderProps {
  onSearch: () => void
}

const navItems = [
  { href: '#journal', label: '文章', en: 'JOURNAL' },
  { href: '#constellation', label: '星图', en: 'ORBIT' },
  { href: '#about', label: '关于', en: 'ABOUT' },
]

export function Header({ onSearch }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <a className="brand" href="#home" aria-label="深空手记首页">
        <span className="brand__mark" aria-hidden="true"><i /></span>
        <span className="brand__text"><strong>深空手记</strong><small>DEEP SPACE NOTES</small></span>
      </a>
      <nav className="desktop-nav" aria-label="主导航">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}><span>{item.label}</span><small>{item.en}</small></a>
        ))}
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onSearch} aria-label="搜索文章"><Search size={19} /></button>
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild>
            <button className="icon-button menu-trigger" type="button" aria-label="打开导航菜单"><Menu size={21} /></button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="mobile-menu" aria-describedby={undefined}>
              <div className="mobile-menu__top">
                <Dialog.Title>去往另一片星空</Dialog.Title>
                <Dialog.Close asChild><button className="icon-button" type="button" aria-label="关闭导航菜单"><X size={22} /></button></Dialog.Close>
              </div>
              <nav aria-label="移动端导航">
                {navItems.map((item, index) => (
                  <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                    <span className="mono">0{index + 1}</span><strong>{item.label}</strong><small>{item.en}</small><ArrowUpRight size={22} />
                  </a>
                ))}
              </nav>
              <p>写作、代码与生活的长期记录。<br />保持好奇，缓慢生长。</p>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
