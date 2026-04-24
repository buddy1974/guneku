import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'

export const metadata = { title: 'Gallery' }

export default function GalleryPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="GALLERY"
        title="GUNEKU IN PICTURES & VIDEO"
        subtitle="Cultural events, ceremonies, and community life captured."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem',
                        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}
               className="grid-cols-1 md:grid-cols-2">
        {[
          { href:'/gallery/images', label:'IMAGE GALLERY', sub:'Events, coronation, diaspora gatherings', count:'338 photos · 15 albums' },
          { href:'/gallery/videos', label:'VIDEO GALLERY', sub:'Speeches, cultural events, community life', count:'YouTube channel' },
        ].map(g => (
          <Link key={g.href} href={g.href}
                style={{ textDecoration:'none', display:'block',
                         backgroundColor:'#0C0C14',
                         border:'1px solid rgba(255,255,255,0.05)',
                         overflow:'hidden' }}
                className="hover:border-[rgba(242,169,11,0.3)] transition-colors group">
            <div style={{ height:'280px', backgroundColor:'#090910',
                          borderBottom:'1px solid rgba(255,255,255,0.05)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          position:'relative' }}>
              <span style={{ fontFamily:'"Bebas Neue", sans-serif',
                             fontSize:'8rem', color:'rgba(242,169,11,0.08)',
                             letterSpacing:'0.05em' }}>
                {g.label.split(' ')[0]}
              </span>
              <div style={{ position:'absolute', top:0, left:0,
                            right:0, height:'3px', backgroundColor:'#8B1E2D' }} />
            </div>
            <div style={{ padding:'2rem' }}>
              <h3 style={{ fontFamily:'"Bebas Neue", sans-serif',
                           fontSize:'1.8rem', color:'#F5F2E9',
                           letterSpacing:'0.05em', margin:'0 0 0.5rem' }}>
                {g.label}
              </h3>
              <p style={{ color:'rgba(245,242,233,0.4)',
                          fontFamily:'Inter, sans-serif', fontSize:'0.9rem',
                          margin:'0 0 0.75rem' }}>
                {g.sub}
              </p>
              <span style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif',
                             fontSize:'0.7rem', letterSpacing:'0.15em',
                             textTransform:'uppercase' }}>
                {g.count}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
