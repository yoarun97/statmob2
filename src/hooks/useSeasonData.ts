import { useState, useEffect, useRef } from 'react';
import type { ParsedSeasonData } from '@/types';

// Vite lazy-loads JSON files matching the pattern. Module cache avoids re-fetching.
const modules = import.meta.glob<{ default: ParsedSeasonData }>(
  '/src/data/seasons/parsed/[0-9]*.json'
);

// Module-level cache so repeated hook calls don't re-import the same season
const cache = new Map<string, ParsedSeasonData>();

interface UseSeasonDataResult {
  data: ParsedSeasonData | null;
  isLoading: boolean;
  error: string | null;
}

export function useSeasonData(season: string): UseSeasonDataResult {
  const [state, setState] = useState<UseSeasonDataResult>(() => {
    const cached = cache.get(season);
    return { data: cached ?? null, isLoading: !cached, error: null };
  });

  // Track which season the current effect is for to avoid stale setState
  const activeRef = useRef(season);
  activeRef.current = season;

  useEffect(() => {
    if (cache.has(season)) {
      setState({ data: cache.get(season)!, isLoading: false, error: null });
      return;
    }

    setState({ data: null, isLoading: true, error: null });

    const key = `/src/data/seasons/parsed/${season}.json`;
    const loader = modules[key];

    if (!loader) {
      setState({ data: null, isLoading: false, error: `No data for season ${season}` });
      return;
    }

    loader().then((mod) => {
      cache.set(season, mod.default);
      if (activeRef.current === season) {
        setState({ data: mod.default, isLoading: false, error: null });
      }
    }).catch((err: Error) => {
      if (activeRef.current === season) {
        setState({ data: null, isLoading: false, error: err.message });
      }
    });
  }, [season]);

  return state;
}
