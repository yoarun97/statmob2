import type { PlayerIndex, PlayerDetail } from '@/types';
import { getPrimaryClub } from '@/lib/clubColors';

interface CareerPlinthProps {
  player: PlayerIndex;
  detail: PlayerDetail | undefined;
  kitPrimary: string;
}

export function CareerPlinth({ player, detail, kitPrimary }: CareerPlinthProps) {
  const clubs = detail
    ? Array.from(new Set(detail.seasonStats.map((s) => s.club)))
    : [player.club];

  const primaryClub = detail
    ? getPrimaryClub(detail.seasonStats)
    : player.club;

  const goalsPerApp = player.appearances > 0
    ? (player.goals / player.appearances).toFixed(2)
    : '-';

  const cells = [
    { label: 'Primary Club', value: primaryClub },
    { label: 'EPL Apps',     value: player.appearances },
    { label: 'Clubs',        value: clubs.length },
    { label: 'Goals / App',  value: goalsPerApp },
  ];

  return (
    <div
      style={{
        background:    '#0a0a12',
        // Dividing accent line between canvas and plinth — visually anchors it
        borderTop:     `2px solid ${kitPrimary}`,
        padding:       '12px 16px',
        display:       'flex',
        justifyContent:'space-around',
        alignItems:    'center',
        gap:           8,
      }}
    >
      {cells.map(({ label, value }) => (
        <div key={label} style={{ textAlign: 'center', minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     typeof value === 'string' && value.length > 10 ? '0.75rem' : '1rem',
              fontWeight:   700,
              color:        '#f0f0f0',
              lineHeight:   1.1,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.55rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         '#7788aa',
              marginTop:     4,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
