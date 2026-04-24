import { HeroSection }    from '@/components/home/HeroSection'
import { StatsBar }        from '@/components/home/StatsBar'
import { PalaceFeature }   from '@/components/home/PalaceFeature'
import { AIAssistant }     from '@/components/home/AIAssistant'
import { LatestUpdates }   from '@/components/home/LatestUpdates'
import { GudecaStrip }     from '@/components/home/GudecaStrip'
import { DiasporaCallout } from '@/components/home/DiasporaCallout'
import { BuiltBySection }  from '@/components/home/BuiltBySection'
import { Reveal }          from '@/components/ui/Reveal'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Reveal direction="none"><StatsBar /></Reveal>
      <Reveal direction="none"><PalaceFeature /></Reveal>
      <Reveal direction="none"><AIAssistant /></Reveal>
      <Reveal direction="none"><LatestUpdates /></Reveal>
      <Reveal direction="none"><GudecaStrip /></Reveal>
      <Reveal direction="none"><DiasporaCallout /></Reveal>
      <BuiltBySection />
    </>
  )
}
