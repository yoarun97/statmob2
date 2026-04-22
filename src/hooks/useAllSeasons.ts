import seasonIndex from '@/data/seasons/parsed/index.json';
import type { SeasonIndexEntry } from '@/types';

// Static import: index.json is small and always needed. No async required.
export function useAllSeasons(): SeasonIndexEntry[] {
  return seasonIndex as SeasonIndexEntry[];
}
