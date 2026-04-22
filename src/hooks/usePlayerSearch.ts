import { useState, useEffect, useMemo } from 'react';
import type { PlayerIndex } from '@/types';
import playerIndex from '@/data/players/index.json';

// Cast the static import — JSON lacks the branded type
const ALL_PLAYERS = playerIndex as PlayerIndex[];

interface UsePlayerSearchOptions {
  query: string;
  club?: string;
  season?: string;
}

// Debounce the query so we don't re-filter on every keystroke
function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function usePlayerSearch({ query, club, season }: UsePlayerSearchOptions): PlayerIndex[] {
  const debouncedQuery = useDebounced(query, 200);

  return useMemo(() => {
    let results = ALL_PLAYERS;

    if (debouncedQuery.trim()) {
      const lower = debouncedQuery.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(lower));
    }

    if (club) {
      results = results.filter((p) => p.club === club);
    }

    if (season) {
      results = results.filter((p) => p.seasons.includes(season));
    }

    return results;
  }, [debouncedQuery, club, season]);
}

// Derived list of unique clubs from the index — used for the dropdown
export const ALL_CLUBS: string[] = Array.from(
  new Set(ALL_PLAYERS.map((p) => p.club))
).sort();
