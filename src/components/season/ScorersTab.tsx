import { motion } from 'framer-motion';
import type { StandingRow } from '@/types';

interface Props {
  standings: StandingRow[];
}

export function ScorersTab({ standings }: Props) {
  // Top 10 clubs by goals scored
  const top = [...standings].sort((a, b) => b.gf - a.gf).slice(0, 10);
  const max = top[0]?.gf ?? 1;

  return (
    <div className="space-y-2 py-2">
      {top.map((row, i) => (
        <div key={row.team} className="flex items-center gap-3">
          <span className="font-stats text-[0.6rem] w-4 text-right text-[var(--text-secondary)] shrink-0">
            {i + 1}
          </span>
          <span className="w-40 shrink-0 text-sm truncate text-[var(--text-primary)]">{row.team}</span>
          <div className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(row.gf / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <span className="font-stats text-sm text-[var(--accent)] w-8 text-right shrink-0 tabular-nums">
            {row.gf}
          </span>
        </div>
      ))}
    </div>
  );
}
