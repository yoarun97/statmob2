import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { useTerraceStore } from '@/lib/store';
import { useSeasonData } from '@/hooks/useSeasonData';
import { seasonStories } from '@/data/seasonStories';
import { ScorersTab } from './ScorersTab';
import { FixturesTab } from './FixturesTab';
import { FormTab } from './FormTab';
import { RecordsTab } from './RecordsTab';

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function SeasonContent() {
  const { activeSeason } = useTerraceStore();
  const { data, isLoading } = useSeasonData(activeSeason);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSeason}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col gap-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Season headline — dateline + editorial title */}
        <div>
          {/* Dateline: "1992 / 93" in mono green — the newspaper masthead stamp */}
          <p
            className="font-stats uppercase mb-2"
            style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--accent)' }}
          >
            {activeSeason.replace('-', ' / ')}
          </p>

          {/* Headline: Playfair Display, clamped to 2 lines */}
          <h2
            className="font-display italic font-black"
            style={{
              fontSize:           'clamp(2rem, 4vw, 3.5rem)',
              lineHeight:         1.1,
              color:              'var(--editorial-text)',
              display:            '-webkit-box',
              WebkitLineClamp:    2,
              WebkitBoxOrient:    'vertical',
              overflow:           'hidden',
            } as React.CSSProperties}
          >
            {seasonStories[activeSeason] ?? activeSeason}
          </h2>

          {/* Rule separating editorial moment from the data below */}
          <div className="mt-4" style={{ borderTop: '1px solid rgba(13,13,13,0.40)' }} />
        </div>

        {isLoading || !data ? (
          <div className="flex items-center justify-center flex-1">
            <span className="font-stats text-xs text-[var(--text-secondary)] animate-pulse">Loading...</span>
          </div>
        ) : (
          <>
            {/* League table — newspaper print style, no cards, pure typography */}
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}><div style={{ minWidth: 320 }}>
              {/* Thick top rule */}
              <div style={{ borderTop: '3px solid var(--editorial-text)' }} />

              {/* Column headers */}
              <div
                className="flex items-center gap-3 py-2 font-stats uppercase text-[var(--editorial-secondary)]"
                style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}
              >
                <span style={{ width: '2.75rem', flexShrink: 0 }} />
                <span className="flex-1" />
                <span style={{ width: '1.5rem', textAlign: 'center' }}>P</span>
                <span style={{ width: '1.5rem', textAlign: 'center' }}>W</span>
                <span style={{ width: '1.5rem', textAlign: 'center' }}>D</span>
                <span style={{ width: '1.5rem', textAlign: 'center' }}>L</span>
                <span style={{ width: '2.25rem', textAlign: 'center' }}>GD</span>
                <span style={{ width: '2rem', textAlign: 'right' }}>Pts</span>
              </div>

              {/* Medium rule under headers */}
              <div style={{ borderTop: '1.5px solid var(--editorial-text)' }} />

              {data.standings.slice(0, 20).map((row, i) => {
                const isChampion = i === 0;
                const isTop4     = i < 4;
                const isRelegated = i >= data.standings.length - 3;
                return (
                  <Fragment key={row.team}>
                    {/* "CHAMPIONS" stamp printed above the first row */}
                    {isChampion && (
                      <div className="pt-2 pb-0.5">
                        <span
                          className="font-stats uppercase"
                          style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--accent)' }}
                        >
                          Champions
                        </span>
                      </div>
                    )}

                    {/* Thin row separator between body rows only */}
                    {i > 0 && (
                      <div style={{ borderTop: '0.5px solid rgba(13,13,13,0.28)' }} />
                    )}

                    <motion.div
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3 py-1.5"
                    >
                      {/* Position — large, dominant, with top-4 accent left border */}
                      <div
                        className="relative flex items-center justify-end shrink-0"
                        style={{ width: '2.75rem', paddingLeft: 6 }}
                      >
                        {isTop4 && (
                          <div
                            className="absolute left-0 rounded-full"
                            style={{ top: 4, bottom: 4, width: 2, background: 'var(--accent)' }}
                          />
                        )}
                        <span
                          className="font-stats tabular-nums font-extrabold"
                          style={{
                            fontSize:  '1.5rem',
                            lineHeight: 1,
                            color:     isRelegated ? '#cc4444' : 'var(--editorial-text)',
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>

                      {/* Club name — Inter semibold, editorial weight */}
                      <span
                        className="flex-1 truncate"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize:   '0.875rem',
                          color:      isChampion ? 'var(--accent)' : 'var(--editorial-text)',
                        }}
                      >
                        {row.team}
                      </span>

                      {/* Stats — JetBrains Mono */}
                      {[row.played, row.won, row.drawn, row.lost].map((v, j) => (
                        <span
                          key={j}
                          className="font-stats tabular-nums text-center"
                          style={{ width: '1.5rem', fontSize: '0.875rem', color: 'var(--editorial-secondary)' }}
                        >
                          {v}
                        </span>
                      ))}
                      <span
                        className="font-stats tabular-nums text-center"
                        style={{ width: '2.25rem', fontSize: '0.875rem', color: 'var(--editorial-secondary)' }}
                      >
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </span>

                      {/* Points — heavier, larger, what matters most */}
                      <span
                        className="font-stats tabular-nums font-extrabold text-right"
                        style={{
                          width:    '2rem',
                          fontSize: '1rem',
                          color:    isChampion ? 'var(--accent)' : 'var(--editorial-text)',
                        }}
                      >
                        {row.points}
                      </span>
                    </motion.div>
                  </Fragment>
                );
              })}

              {/* Thick bottom rule */}
              <div style={{ borderTop: '3px solid var(--editorial-text)' }} />
            </div></div>

            {/* Tabs */}
            <Tabs.Root defaultValue="scorers" className="flex flex-col gap-4">
              <Tabs.List className="flex gap-6 border-b border-[var(--border)]">
                {(['scorers', 'fixtures', 'form', 'records'] as const).map((tab) => (
                  <Tabs.Trigger
                    key={tab}
                    value={tab}
                    className="pb-2 text-xs uppercase tracking-widest text-[var(--text-secondary)] capitalize
                      data-[state=active]:text-[var(--accent)] data-[state=active]:border-b-2
                      data-[state=active]:border-[var(--accent)] transition-colors focus-visible:outline-none"
                  >
                    {tab}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="scorers">
                <ScorersTab standings={data.standings} />
              </Tabs.Content>
              <Tabs.Content value="fixtures">
                <FixturesTab matches={data.matches} />
              </Tabs.Content>
              <Tabs.Content value="form">
                <FormTab standings={data.standings} matches={data.matches} />
              </Tabs.Content>
              <Tabs.Content value="records">
                <RecordsTab data={data} />
              </Tabs.Content>
            </Tabs.Root>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
