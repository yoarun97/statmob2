import { useState, useRef, useId, useMemo, useEffect } from 'react';
import type { PlayerIndex } from '@/types';
import { usePlayerSearch, ALL_CLUBS } from '@/hooks/usePlayerSearch';
import { useTerraceStore } from '@/lib/store';
import { usePlayerData } from '@/hooks/usePlayerData';

function generateSeasons(): string[] {
  const seasons: string[] = [];
  for (let y = 1992; y <= 2024; y++) {
    seasons.push(`${y}-${String(y + 1).slice(2)}`);
  }
  return seasons;
}

const ALL_SEASONS = generateSeasons();

export function PlayerSearch() {
  const [query, setQuery]   = useState('');
  const [club, setClub]     = useState('');
  const [season, setSeason] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const setActivePlayer = useTerraceStore((s) => s.setActivePlayer);
  const activePlayer    = useTerraceStore((s) => s.activePlayer);
  const setStatClub     = useTerraceStore((s) => s.setStatClub);
  const setStatSeason   = useTerraceStore((s) => s.setStatSeason);

  // Load detail for the active player — cached by usePlayerData so no duplicate fetch
  const { data: detail } = usePlayerData(activePlayer?.id ?? null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listId   = useId();

  // When a player is active, scope dropdown options to their actual clubs and seasons.
  // This makes the filters contextually relevant to whoever is on screen.
  const clubOptions = useMemo<string[]>(() => {
    if (!activePlayer) return ALL_CLUBS;
    if (detail) {
      const playerClubs = Array.from(new Set(detail.seasonStats.map((s) => s.club))).sort();
      return playerClubs.length ? playerClubs : [activePlayer.club];
    }
    return [activePlayer.club];
  }, [activePlayer, detail]);

  const seasonOptions = useMemo<string[]>(() => {
    if (!activePlayer) return ALL_SEASONS;
    // Most recent first
    return [...activePlayer.seasons].sort((a, b) => b.localeCompare(a));
  }, [activePlayer]);

  // Clear filter values that no longer appear in the scoped options
  useEffect(() => {
    if (club && !clubOptions.includes(club)) setClub('');
  }, [clubOptions, club]);

  useEffect(() => {
    if (season && !seasonOptions.includes(season)) setSeason('');
  }, [seasonOptions, season]);

  const results      = usePlayerSearch({ query, club, season });
  const showDropdown = isOpen && query.trim().length > 0 && results.length > 0;
  const displayResults = results.slice(0, 6);

  function handleSelect(player: PlayerIndex) {
    setActivePlayer(player);
    setQuery(player.name);
    setIsOpen(false);
    // Clear any active stat filters when switching to a new player
    setClub('');
    setSeason('');
    setStatClub('');
    setStatSeason('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') setIsOpen(false);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Text search */}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search player..."
          aria-autocomplete="list"
          aria-controls={showDropdown ? listId : undefined}
          className="w-full px-3 py-2 text-sm bg-[#0d0d14] border border-[#2a2a3a] rounded text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        />

        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded border border-[#2a2a3a] overflow-hidden"
            style={{ background: '#0d0d18' }}
          >
            {displayResults.map((player) => (
              <li
                key={player.id}
                role="option"
                aria-selected={false}
                onMouseDown={() => handleSelect(player)}
                className="px-3 py-2 cursor-pointer text-sm text-[var(--text-primary)] hover:bg-[rgba(0,168,85,0.12)] hover:text-[var(--accent)] transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <span>{player.name}</span>
                <span className="ml-2 text-xs text-[var(--text-secondary)]">{player.club}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Club filter — options scoped to active player when one is loaded */}
      <select
        value={club}
        onChange={(e) => { setClub(e.target.value); setStatClub(e.target.value); }}
        className="px-3 py-2 text-sm bg-[#0d0d14] border border-[#2a2a3a] rounded text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
        title={activePlayer ? `Clubs for ${activePlayer.name}` : 'All clubs'}
      >
        <option value="">{activePlayer ? 'All their clubs' : 'All clubs'}</option>
        {clubOptions.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Season filter — options scoped to active player's seasons */}
      <select
        value={season}
        onChange={(e) => { setSeason(e.target.value); setStatSeason(e.target.value); }}
        className="px-3 py-2 text-sm bg-[#0d0d14] border border-[#2a2a3a] rounded text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
        title={activePlayer ? `Seasons for ${activePlayer.name}` : 'All seasons'}
      >
        <option value="">{activePlayer ? 'All their seasons' : 'All seasons'}</option>
        {seasonOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
