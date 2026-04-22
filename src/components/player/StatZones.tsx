import { AnimatePresence, motion } from 'framer-motion';
import type { PlayerIndex } from '@/types';

interface StatZonesProps {
  revealedZones: Set<string>;
  player: PlayerIndex;
}

interface ZoneConfig {
  top: string;
  left: string;
  label: string;
  // which edge of the card faces the figure (where the connector lives)
  connectorSide: 'left' | 'right';
}

const ZONE_CONFIG: Record<string, ZoneConfig> = {
  head:  { top: '4%',  left: '60%', label: 'HEAD',  connectorSide: 'left'  },
  chest: { top: '22%', left: '64%', label: 'CHEST', connectorSide: 'left'  },
  arms:  { top: '32%', left: '6%',  label: 'ARMS',  connectorSide: 'right' },
  waist: { top: '42%', left: '64%', label: 'WAIST', connectorSide: 'left'  },
  legs:  { top: '57%', left: '64%', label: 'LEGS',  connectorSide: 'left'  },
  feet:  { top: '74%', left: '60%', label: 'FEET',  connectorSide: 'left'  },
};

interface Stat {
  label: string;
  value: string | number;
}

function buildZoneStats(zone: string, player: PlayerIndex): Stat[] {
  // Only primary club is available in the index; treat as 1 unique club
  const uniqueClubs = 1;

  const goalsPerSeason = (player.goals / Math.max(player.seasons.length, 1)).toFixed(1);

  switch (zone) {
    case 'head':
      return [
        { label: 'Goals', value: player.goals },
        { label: 'Seasons', value: player.seasons.length },
      ];
    case 'chest':
      return [
        { label: 'EPL Apps', value: player.appearances },
      ];
    case 'arms':
      return [
        { label: 'Club', value: player.club },
      ];
    case 'waist':
      return [
        { label: 'Clubs', value: uniqueClubs },
      ];
    case 'legs':
      return [
        { label: 'Goals/Season', value: goalsPerSeason },
      ];
    case 'feet':
      return [
        { label: 'First', value: player.seasons[0] ?? '-' },
        { label: 'Last', value: player.seasons[player.seasons.length - 1] ?? '-' },
      ];
    default:
      return [];
  }
}

export function StatZones({ revealedZones, player }: StatZonesProps) {
  return (
    // Pointer events none so the canvas below stays interactive
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {Object.entries(ZONE_CONFIG).map(([zone, config]) => {
          if (!revealedZones.has(zone)) return null;
          const stats = buildZoneStats(zone, player);
          // Cards on the left side of the figure slide in from left, others from right
          const fromLeft = config.connectorSide === 'right';

          return (
            <motion.div
              key={zone}
              initial={{ opacity: 0, scale: 0.85, x: fromLeft ? -8 : 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: fromLeft ? -8 : 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: config.top,
                left: config.left,
                background: 'rgba(10,10,15,0.9)',
                border: '1px solid rgba(0,168,85,0.4)',
                borderRadius: '4px',
                padding: '6px 10px',
                minWidth: '90px',
              }}
            >
              {/* Connector: dot + line pointing toward the figure */}
              {config.connectorSide === 'left' ? (
                // Card is on the right: connector exits through the left edge
                <div
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ width: '24px', height: '1px', background: 'rgba(0,168,85,0.25)' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00A855', flexShrink: 0 }} />
                </div>
              ) : (
                // Card is on the left (arms): connector exits through the right edge
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00A855', flexShrink: 0 }} />
                  <div style={{ width: '24px', height: '1px', background: 'rgba(0,168,85,0.25)' }} />
                </div>
              )}

              {/* Zone label */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#00A855',
                  marginBottom: '4px',
                }}
              >
                {config.label}
              </div>

              {/* Stats */}
              {stats.map((stat) => (
                <div key={stat.label} style={{ fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#f0f0f0', fontWeight: 600 }}>
                    {stat.value}
                  </span>
                  {' '}
                  <span style={{ fontSize: '0.6rem', color: '#8888aa' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
