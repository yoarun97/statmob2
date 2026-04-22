import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ParsedMatch } from '@/types';

interface Props {
  matches: ParsedMatch[];
}

const ROW_HEIGHT = 36;

export function FixturesTab({ matches }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto"
      style={{ height: 380, scrollbarWidth: 'thin' }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((vItem) => {
          const m = matches[vItem.index];
          const homeWin = m.homeGoals > m.awayGoals;
          const awayWin = m.awayGoals > m.homeGoals;
          return (
            <div
              key={vItem.key}
              style={{
                position: 'absolute',
                top: vItem.start,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
              }}
              className="flex items-center gap-2 px-1 border-b border-[var(--border)] text-xs"
            >
              <span className="font-stats text-[0.55rem] w-5 text-[var(--text-secondary)] shrink-0 tabular-nums">
                {m.matchday}
              </span>
              <span className={`flex-1 text-right truncate ${homeWin ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                {m.home}
              </span>
              <span className="font-stats text-sm font-medium w-12 text-center shrink-0 tabular-nums text-[var(--text-primary)]">
                {m.homeGoals}–{m.awayGoals}
              </span>
              <span className={`flex-1 truncate ${awayWin ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                {m.away}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
