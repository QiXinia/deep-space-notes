import type { Article } from '@/types/blog'

interface CosmicArtworkProps {
  variant: Article['artwork']
  title: string
}

export function CosmicArtwork({ variant, title }: CosmicArtworkProps) {
  return (
    <div className={`artwork artwork--${variant}`} role="img" aria-label={`${title}的抽象宇宙插图`}>
      <span className="artwork__stars" />
      <span className="artwork__shape artwork__shape--one" />
      <span className="artwork__shape artwork__shape--two" />
      <span className="artwork__orbit" />
      <span className="artwork__index">DEEP FIELD / {variant.toUpperCase()}</span>
    </div>
  )
}
