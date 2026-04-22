import { useEffect, useMemo } from 'react';
import { StadiumSection } from '@/components/layout/StadiumSection';
import { PlayerSearch } from '@/components/player/PlayerSearch';
import { PlayerCanvas } from '@/components/3d/PlayerCanvas';
import { PlayerProfile } from '@/components/player/PlayerProfile';
import { CareerPlinth } from '@/components/player/CareerPlinth';
import { ZoneCardOverlay } from '@/components/player/ZoneCardOverlay';
import { useTerraceStore } from '@/lib/store';
import { useScanState } from '@/hooks/useScanState';
import { usePlayerData } from '@/hooks/usePlayerData';
import { getClubColors, getPrimaryClub } from '@/lib/clubColors';

export function PlayerDNA() {
  const activePlayer = useTerraceStore((s) => s.activePlayer);
  const { isScanning, revealedZones, scanComplete, startScan, revealZone, completeScan } =
    useScanState();

  const { data: detail } = usePlayerData(activePlayer?.id ?? null);

  const statClub   = useTerraceStore((s) => s.statClub);
  const statSeason = useTerraceStore((s) => s.statSeason);

  // Filtered detail: apply club/season filters to seasonStats.
  // Components downstream use this so hero stats, chart, and zone cards all reflect the filter.
  const filteredDetail = useMemo(() => {
    if (!detail) return undefined;
    const stats = detail.seasonStats.filter(
      (s) => (!statClub || s.club === statClub) && (!statSeason || s.season === statSeason),
    );
    return { ...detail, seasonStats: stats };
  }, [detail, statClub, statSeason]);

  // Use the club where the player scored the most career goals for kit colors.
  // Falls back to the index club until detail has loaded.
  const primaryClub = detail
    ? getPrimaryClub(detail.seasonStats)
    : (activePlayer?.club ?? '');
  const clubColors = getClubColors(primaryClub);

  // Re-trigger the scan beam whenever a new player is selected
  useEffect(() => {
    if (activePlayer) startScan();
  }, [activePlayer, startScan]);

  return (
    <StadiumSection
      id="players"
      className="min-h-screen flex flex-col px-4 md:px-12 py-12 md:py-16 gap-6 md:gap-8"
    >
      <p
        className="text-sm font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] opacity-70"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        02 / Player DNA
      </p>

      <PlayerSearch />

      {/* Two-column layout: stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">

        {/* Left column: 3D canvas + plinth, unified as one bordered panel */}
        <div className="md:w-[45%] flex flex-col" style={{ minHeight: 380 }}>
          <div
            style={{
              flex:         1,
              display:      'flex',
              flexDirection:'column',
              border:       '1px solid #1a1a2a',
              borderRadius: 8,
              overflow:     'hidden',
              // Explicit min-height so canvas is useful on mobile
              minHeight:    380,
            }}
          >
            {/* Canvas — fills available height; zone cards are absolutely positioned inside */}
            <div style={{ position: 'relative', flex: 1, minHeight: 320 }}>
              <PlayerCanvas
                className="absolute inset-0 w-full h-full"
                hasPlayer={!!activePlayer}
                isScanning={isScanning}
                kitPrimary={clubColors.primary}
                kitSecondary={clubColors.secondary}
                onZoneReveal={revealZone}
                onScanComplete={completeScan}
              />

              {activePlayer && (
                <ZoneCardOverlay
                  revealedZones={revealedZones}
                  player={activePlayer}
                  detail={filteredDetail}
                  kitPrimary={clubColors.primary}
                />
              )}
            </div>

            {/* Plinth — shares the outer border/radius via the parent container */}
            {activePlayer && (
              <CareerPlinth
                player={activePlayer}
                detail={filteredDetail}
                kitPrimary={clubColors.primary}
              />
            )}
          </div>
        </div>

        {/* Right column: player data dashboard */}
        <div
          className="md:w-[55%] flex flex-col justify-start"
          style={{ background: '#0e0e1a', borderRadius: 8, padding: '20px 24px' }}
        >
          {!activePlayer && (
            <div className="flex items-center justify-center h-full py-16">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#8888aa' }}>
                Search for a player to begin
              </p>
            </div>
          )}

          {activePlayer && !scanComplete && (
            <div className="flex items-center gap-3 py-4">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#8888aa' }}>
                Scanning...
              </span>
            </div>
          )}

          {activePlayer && scanComplete && (
            <PlayerProfile
              player={activePlayer}
              detail={filteredDetail}
              kitPrimary={clubColors.primary}
              primaryClub={primaryClub}
            />
          )}
        </div>

      </div>
    </StadiumSection>
  );
}
