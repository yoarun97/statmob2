import { useState, useEffect, useRef } from 'react';
import type { PlayerDetail } from '@/types';

// Vite glob for all player JSON files — enables dynamic import by id
const modules = import.meta.glob<{ default: PlayerDetail }>(
  '/src/data/players/[a-z]*.json'
);

// Module-level cache so repeated hook calls don't re-import the same player
const cache = new Map<string, PlayerDetail>();

interface UsePlayerDataResult {
  data: PlayerDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlayerData(id: string | null): UsePlayerDataResult {
  const [state, setState] = useState<UsePlayerDataResult>(() => {
    if (!id) return { data: null, isLoading: false, error: null };
    const cached = cache.get(id);
    return { data: cached ?? null, isLoading: !cached, error: null };
  });

  // Track the active id to ignore results from stale fetches
  const activeRef = useRef(id);
  activeRef.current = id;

  useEffect(() => {
    if (!id) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    if (cache.has(id)) {
      setState({ data: cache.get(id)!, isLoading: false, error: null });
      return;
    }

    setState({ data: null, isLoading: true, error: null });

    const key = `/src/data/players/${id}.json`;
    const loader = modules[key];

    if (!loader) {
      setState({ data: null, isLoading: false, error: `No data for player ${id}` });
      return;
    }

    loader()
      .then((mod) => {
        cache.set(id, mod.default);
        if (activeRef.current === id) {
          setState({ data: mod.default, isLoading: false, error: null });
        }
      })
      .catch((err: Error) => {
        if (activeRef.current === id) {
          setState({ data: null, isLoading: false, error: err.message });
        }
      });
  }, [id]);

  return state;
}
