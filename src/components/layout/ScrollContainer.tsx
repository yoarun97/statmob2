import { Nav } from './Nav';
import Hero from '@/components/sections/Hero';
import { SeasonExplorer } from '@/components/sections/SeasonExplorer';
import { PlayerDNA } from '@/components/sections/PlayerDNA';
import { Clubs } from '@/components/sections/Clubs';
import { HeadToHead } from '@/components/sections/HeadToHead';
import { Legends } from '@/components/sections/Legends';
import { Live } from '@/components/sections/Live';

// Skin assignments:
//   Hero          → Stadium (dark, atmospheric)
//   Season        → Editorial (light on entry)
//   Player DNA    → Stadium
//   Clubs         → Editorial
//   Head to Head  → Stadium
//   Legends       → Editorial
//   Live          → Stadium

export function ScrollContainer() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SeasonExplorer />
        <PlayerDNA />
        <Clubs />
        <HeadToHead />
        <Legends />
        <Live />
      </main>
    </>
  );
}
