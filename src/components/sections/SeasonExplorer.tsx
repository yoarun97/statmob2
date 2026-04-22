import { motion } from 'framer-motion';
import { EditorialSection } from '@/components/layout/EditorialSection';
import { FilmStrip } from '@/components/season/FilmStrip';
import { SeasonContent } from '@/components/season/SeasonContent';
import { useAllSeasons } from '@/hooks/useAllSeasons';
import { useTerraceStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SeasonExplorer() {
  const rawSeasons = useAllSeasons();
  const seasons = [...rawSeasons].reverse();
  const { activeSeason, setActiveSeason } = useTerraceStore();

  return (
    <EditorialSection
      id="season"
      className="min-h-screen flex flex-col"
    >
      {/* Section label */}
      <div className="px-4 md:px-8 pt-16 pb-4">
        <p className="font-stats text-sm font-semibold tracking-[0.18em] uppercase opacity-70" style={{ color: 'inherit' }}>
          01 / Season Explorer
        </p>
      </div>

      {/* Mobile: horizontal season pill scroller, full-width content below */}
      <div className="md:hidden flex flex-col flex-1 min-w-0">
        <div
          className="flex gap-2 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {seasons.map((s) => (
            <button
              key={s.season}
              onClick={() => setActiveSeason(s.season)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded text-xs border transition-colors',
                s.season === activeSeason
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,168,85,0.08)]'
                  : 'border-[var(--editorial-border,rgba(13,13,13,0.2))] text-[var(--editorial-secondary)]',
              )}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {s.season}
            </button>
          ))}
        </div>
        <div className="px-4 pb-8 min-w-0">
          <SeasonContent />
        </div>
      </div>

      {/* Desktop: film strip sidebar + content panel */}
      <div
        className="hidden md:flex gap-0 flex-1"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="w-52 shrink-0 sticky top-0 h-screen overflow-hidden"
          initial={{ opacity: 0, x: -60, rotateY: -8 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <FilmStrip />
        </motion.div>

        <motion.div
          className="flex-1 px-8 py-4 min-w-0"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
        >
          <SeasonContent />
        </motion.div>
      </div>
    </EditorialSection>
  );
}
