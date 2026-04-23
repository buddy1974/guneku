import { HeroSection }    from '@/components/home/HeroSection'
import { StatsBar }        from '@/components/home/StatsBar'
import { PalaceFeature }   from '@/components/home/PalaceFeature'
import { AIAssistant }     from '@/components/home/AIAssistant'
import { LatestUpdates }   from '@/components/home/LatestUpdates'
import { GudecaStrip }     from '@/components/home/GudecaStrip'
import { DiasporaCallout } from '@/components/home/DiasporaCallout'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <PalaceFeature />
      <AIAssistant />
      <LatestUpdates />
      <GudecaStrip />
      <DiasporaCallout />
    </>
  )
}
