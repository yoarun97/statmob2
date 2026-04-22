import type { ParsedSeasonData } from '@/types';

interface Props {
  data: ParsedSeasonData;
}

interface Record {
  label: string;
  value: string;
}

function computeRecords(data: ParsedSeasonData): Record[] {
  const { matches, standings } = data;
  if (!matches.length || !standings.length) return [];

  const records: Record[] = [];

  // Champion
  records.push({ label: 'Champion', value: standings[0]?.team ?? 'Unknown' });

  // Relegated (bottom 3)
  const bottom = standings.slice(-3).map(r => r.team).reverse();
  records.push({ label: 'Relegated', value: bottom.join(', ') });

  // Highest points
  records.push({ label: 'Points record', value: `${standings[0]?.points} (${standings[0]?.team})` });

  // Total goals
  records.push({ label: 'Goals scored', value: String(data.totalGoals) });

  // Goals per game
  const gpg = (data.totalGoals / matches.length).toFixed(2);
  records.push({ label: 'Goals per game', value: gpg });

  // Biggest win
  let biggestWin = matches[0];
  for (const m of matches) {
    const diff = Math.abs(m.homeGoals - m.awayGoals);
    const prevDiff = Math.abs(biggestWin.homeGoals - biggestWin.awayGoals);
    if (diff > prevDiff) biggestWin = m;
  }
  const bwDiff = Math.abs(biggestWin.homeGoals - biggestWin.awayGoals);
  if (bwDiff >= 5) {
    records.push({
      label: 'Biggest win',
      value: `${biggestWin.home} ${biggestWin.homeGoals}-${biggestWin.awayGoals} ${biggestWin.away}`,
    });
  }

  // Highest scoring game
  let highestScoring = matches[0];
  for (const m of matches) {
    if (m.homeGoals + m.awayGoals > highestScoring.homeGoals + highestScoring.awayGoals) {
      highestScoring = m;
    }
  }
  records.push({
    label: 'Highest scoring',
    value: `${highestScoring.home} ${highestScoring.homeGoals}-${highestScoring.awayGoals} ${highestScoring.away} (${highestScoring.homeGoals + highestScoring.awayGoals} goals)`,
  });

  // Teams
  records.push({ label: 'Teams', value: String(standings.length) });

  // Clean sheets leader (fewest goals conceded)
  const bestDef = standings.reduce((a, b) => a.ga < b.ga ? a : b);
  records.push({ label: 'Best defence', value: `${bestDef.team} (${bestDef.ga} conceded)` });

  return records;
}

export function RecordsTab({ data }: Props) {
  const records = computeRecords(data);

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-2">
      {records.map((r) => (
        <div key={r.label}>
          <div className="text-[0.65rem] uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">
            {r.label}
          </div>
          <div className="text-sm text-[var(--text-primary)] font-medium leading-tight">{r.value}</div>
        </div>
      ))}
    </div>
  );
}
