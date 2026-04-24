import { getVideoGallery } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'

export const metadata = { title: 'Video Gallery' }

export default function VideoGalleryPage() {
  const gallery = getVideoGallery()
  const videos = (gallery as any)?.dbVideos || []

  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="VIDEO GALLERY"
        title="GUNEKU ON VIDEO"
        subtitle="Speeches, cultural events, and community life. Full channel coming soon."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        {/* Featured video */}
        {(gallery as any)?.featuredVideoId && (
          <div style={{ marginBottom:'4rem' }}>
            <div className="section-label" style={{ marginBottom:'1rem', display:'block' }}>
              FEATURED VIDEO
            </div>
            <div style={{ position:'relative', paddingBottom:'56.25%',
                          height:0, overflow:'hidden',
                          border:'1px solid rgba(242,169,11,0.15)' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${(gallery as any).featuredVideoId}`}
                title="Featured Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ position:'absolute', top:0, left:0,
                         width:'100%', height:'100%', border:'none' }}
              />
            </div>
          </div>
        )}

        {/* DB videos */}
        {videos.length > 0 && (
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
                        gap:'1.5rem', marginBottom:'3rem' }}>
            {videos.map((v: any) => (
              <div key={v.id} style={{ backgroundColor:'#0C0C14',
                                       border:'1px solid rgba(255,255,255,0.05)',
                                       overflow:'hidden' }}>
                <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.youtubeId || v.youtube}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    style={{ position:'absolute', top:0, left:0,
                             width:'100%', height:'100%', border:'none' }}
                  />
                </div>
                <div style={{ padding:'1rem' }}>
                  <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                               color:'#F5F2E9', fontSize:'0.95rem', margin:0 }}>
                    {v.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YouTube channel link */}
        <div style={{ textAlign:'center', padding:'3rem',
                      border:'1px solid rgba(255,255,255,0.05)',
                      backgroundColor:'#0C0C14' }}>
          <p style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif',
                      fontSize:'1rem', margin:'0 0 1.5rem' }}>
            Full video archive available on the official Guneku YouTube channel
          </p>
          <a href={`https://www.youtube.com/channel/${(gallery as any)?.youtubeChannelId}`}
             target="_blank" rel="noopener noreferrer"
             style={{ backgroundColor:'#f2a90b', color:'#0F0F0F',
                       fontFamily:'Syne, sans-serif', fontWeight:700,
                       padding:'0.85rem 2rem', fontSize:'0.78rem',
                       letterSpacing:'0.12em', textTransform:'uppercase',
                       textDecoration:'none', display:'inline-block' }}>
            Visit YouTube Channel
          </a>
        </div>
      </section>
    </main>
  )
}
