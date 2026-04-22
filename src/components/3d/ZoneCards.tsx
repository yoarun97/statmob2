import { Html } from '@react-three/drei';
import type { PlayerIndex } from '@/types';

interface ZoneCardsProps {
  revealedZones: Set<string>;
  player: PlayerIndex;
}

// Zone anchor positions in the group's LOCAL coordinate space (group scale = 2.5).
// x offset puts the card to the right of the figure.
const ZONES = {
  head: {
    cardPos:  [0.30, 0.43, 0.0] as [number, number, number],
    glowPos:  [0.00, 0.44, 0.12] as [number, number, number],
  },
  legs: {
    cardPos:  [0.30, -0.14, 0.0] as [number, number, number],
    glowPos:  [0.00, -0.15, 0.10] as [number, number, number],
  },
  feet: {
    cardPos:  [0.28, -0.36, 0.0] as [number, number, number],
    glowPos:  [0.00, -0.37, 0.10] as [number, number, number],
  },
} as const;

function buildStats(zone: keyof typeof ZONES, player: PlayerIndex) {
  switch (zone) {
    case 'head':
      return [
        { label: 'Goals',   value: player.goals },
        { label: 'Seasons', value: player.seasons.length },
      ];
    case 'legs':
      return [
        { label: 'Goals/Season', value: (player.goals / Math.max(player.seasons.length, 1)).toFixed(1) },
      ];
    case 'feet':
      return [
        { label: 'First', value: player.seasons[0] ?? '-' },
        { label: 'Last',  value: player.seasons[player.seasons.length - 1] ?? '-' },
      ];
  }
}

const LABEL_MAP: Record<keyof typeof ZONES, string> = {
  head: 'HEAD',
  legs: 'LEGS',
  feet: 'FEET',
};

export function ZoneCards({ revealedZones, player }: ZoneCardsProps) {
  return (
    <>
      {(Object.keys(ZONES) as Array<keyof typeof ZONES>).map((zone) => {
        const revealed = revealedZones.has(zone);
        const cfg = ZONES[zone];
        const stats = buildStats(zone, player);

        return (
          <group key={zone}>
            {/* Glow orb — tight emissive sphere at the body part */}
            {revealed && (
              <mesh position={cfg.glowPos}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial
                  color="#00A855"
                  emissive="#00A855"
                  emissiveIntensity={3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}

            {/* Html card that tracks the 3D anchor as the model rotates */}
            {revealed && (
              <Html
                position={cfg.cardPos}
                style={{ pointerEvents: 'none' }}
                zIndexRange={[50, 0]}
              >
                <div
                  style={{
                    background:    'rgba(10,10,15,0.92)',
                    border:        '1px solid rgba(0,168,85,0.45)',
                    borderRadius:  4,
                    padding:       '5px 9px',
                    minWidth:      80,
                    whiteSpace:    'nowrap',
                  }}
                >
                  {/* Zone label */}
                  <div
                    style={{
                      fontFamily:    'var(--font-mono)',
                      fontSize:      '0.55rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color:         '#00A855',
                      marginBottom:  3,
                    }}
                  >
                    {LABEL_MAP[zone]}
                  </div>

                  {/* Stats */}
                  {stats.map((s) => (
                    <div key={s.label} style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.3 }}>
                      <span style={{ fontSize: '0.8rem', color: '#f0f0f0', fontWeight: 600 }}>
                        {s.value}
                      </span>{' '}
                      <span style={{ fontSize: '0.58rem', color: '#8888aa' }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
