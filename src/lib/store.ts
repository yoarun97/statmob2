import { create } from 'zustand';
import type { PlayerIndex } from '@/types';

interface TerraceStore {
  activeSeason: string;
  setActiveSeason: (season: string) => void;
  activeSkin: 'stadium' | 'editorial';
  setActiveSkin: (skin: 'stadium' | 'editorial') => void;
  activePlayer: PlayerIndex | null;
  setActivePlayer: (p: PlayerIndex | null) => void;
  // Bridges the HTML zone card overlay to the R3F mesh glow system.
  // Both read via getState() inside useFrame to avoid React render overhead.
  hoveredZone: string | null;
  setHoveredZone: (zone: string | null) => void;
  // Pinned zone persists the glow until the card is clicked again.
  pinnedZone: string | null;
  setPinnedZone: (zone: string | null) => void;
  // Active filter values for the stats panel and zone cards.
  // Empty string means "no filter applied".
  statClub: string;
  setStatClub: (club: string) => void;
  statSeason: string;
  setStatSeason: (season: string) => void;
}

export const useTerraceStore = create<TerraceStore>((set) => ({
  activeSeason: '2024-25',
  setActiveSeason: (season) => set({ activeSeason: season }),
  activeSkin: 'stadium',
  setActiveSkin: (skin) => set({ activeSkin: skin }),
  activePlayer: null,
  setActivePlayer: (p) => set({ activePlayer: p }),
  hoveredZone: null,
  setHoveredZone: (zone) => set({ hoveredZone: zone }),
  pinnedZone: null,
  setPinnedZone: (zone) => set({ pinnedZone: zone }),
  statClub: '',
  setStatClub: (club) => set({ statClub: club }),
  statSeason: '',
  setStatSeason: (season) => set({ statSeason: season }),
}));
