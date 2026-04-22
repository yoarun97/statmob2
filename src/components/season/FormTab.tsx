import type { StandingRow, ParsedMatch } from '@/types';

interface Props {
  standings: StandingRow[];
  matches: ParsedMatch[];
}

const RESULT_COUNT = 10;

function getLastN(team: string, matches: ParsedMatch[], n: number): ('W' | 'D' | 'L')[] {
  // Walk from most recent matchday backwards
  const results: ('W' | 'D' | 'L')[] = [];
  for (let i = matches.length - 1; i >= 0 && results.length < n; i--) {
    const m = matches[i];
    if (m.home === team) {
      results.push(m.homeGoals > m.awayGoals ? 'W' : m.homeGoals === m.awayGoals ? 'D' : 'L');
    } else if (m.away === team) {
      results.push(m.awayGoals > m.homeGoals ? 'W' : m.awayGoals === m.homeGoals ? 'D' : 'L');
    }
  }
  return results.reverse();
}

const DOT: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-[var(--accent)]',
  D: 'bg-amber-400',
  L: 'bg-red-500',
};

export function FormTab({ standings, matches }: Props) {
  const top = standings.slice(0, 12);

  return (
    <div className="space-y-2 py-2">
      {top.map((row) => {
        const form = getLastN(row.team, matches, RESULT_COUNT);
        return (
          <div key={row.team} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm truncate text-[var(--text-primary)]">{row.team}</span>
            <div className="flex gap-1">
              {form.map((r, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${DOT[r]}`}
                  title={r}
                />
              ))}
              {/* Pad to fixed width if fewer than RESULT_COUNT results */}
              {Array.from({ length: RESULT_COUNT - form.length }).map((_, i) => (
                <div key={`pad-${i}`} className="w-3 h-3 rounded-full bg-[var(--bg-surface)]" />
              ))}
            </div>
            <span className="font-stats text-xs text-[var(--text-secondary)] tabular-nums ml-auto">
              {row.points}pts
            </span>
          </div>
        );
      })}
    </div>
  );
}
