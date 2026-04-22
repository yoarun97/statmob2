import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerIndex, PlayerDetail } from '@/types';
import { useTerraceStore } from '@/lib/store';

interface ZoneCardOverlayProps {
  revealedZones: Set<string>;
  player: PlayerIndex;
  detail: PlayerDetail | undefined;
  kitPrimary: string;
}

interface ZoneSpec {
  id:         string;
  label:      string;    // display name
  top:        string;    // CSS top% within the canvas
  side:       'left' | 'right';
  // Primary stat shown large; secondary shown small below
  primary:    (p: PlayerIndex, d: PlayerDetail | undefined) => { value: string | number; sub: string };
  // Body-part anchor in viewBox % coordinates [x, y] for the connector line
  anchor:     [number, number];
}

// Renamed and regrouped to reflect what each body region means for a footballer.
// Connector lines go from card inner edge to the body-part anchor on the 3D figure.
const ZONES: ZoneSpec[] = [
  {
    id:     'profile',
    label:  'Identity',
    top:    '5%',
    side:   'left',
    anchor: [49, 13],  // head region
    primary: (p) => ({
      value: p.position ?? 'FWD',
      sub:   `${p.seasons[0] ?? '-'} to ${p.seasons[p.seasons.length - 1] ?? '-'}`,
    }),
  },
  {
    id:     'engine',
    label:  'Output',
    top:    '29%',
    side:   'right',
    anchor: [51, 36],  // torso / engine
    primary: (p, d) => {
      // Use filtered seasonStats when available, fall back to career averages
      if (d && d.seasonStats.length > 0) {
        const totalGoals   = d.seasonStats.reduce((sum, s) => sum + s.goals, 0);
        const seasonCount  = d.seasonStats.length;
        return {
          value: (totalGoals / seasonCount).toFixed(1),
          sub:   'goals per season',
        };
      }
      return {
        value: (p.goals / Math.max(p.seasons.length, 1)).toFixed(1),
        sub:   'goals per season',
      };
    },
  },
  {
    id:     'record',
    label:  'Goals',
    top:    '53%',
    side:   'left',
    anchor: [54, 63],  // ball level
    primary: (p, d) => {
      const stats = d?.seasonStats ?? [];
      const peak  = stats.reduce<{ season: string; goals: number } | null>((best, s) => {
        if (!best || s.goals > best.goals) return s;
        return best;
      }, null);
      // Show filtered total when a filter is active, career total otherwise
      const total = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.goals, 0)
        : p.goals;
      return {
        value: total,
        sub:   peak ? `peak ${peak.goals}g, ${peak.season}` : 'career total',
      };
    },
  },
  {
    id:     'career',
    label:  'Appearances',
    top:    '75%',
    side:   'right',
    anchor: [50, 83],  // feet / pedestal
    primary: (p, d) => {
      const clubs = d
        ? Array.from(new Set(d.seasonStats.map((s) => s.club))).length
        : 1;
      const rate = p.appearances > 0
        ? `${(p.goals / p.appearances).toFixed(2)} per app`
        : '';
      return {
        value: p.appearances,
        sub:   `${clubs} club${clubs > 1 ? 's' : ''} · ${rate}`,
      };
    },
  },
];

// Card inner-edge X in viewBox % — left cards connect from their right side, right from left
const LEFT_CARD_X  = 25;  // right edge of left-side cards (~132px / 530px canvas)
const RIGHT_CARD_X = 75;  // left edge of right-side cards

export function ZoneCardOverlay({ revealedZones, player, detail, kitPrimary }: ZoneCardOverlayProps) {
  const setHoveredZone = useTerraceStore((s) => s.setHoveredZone);
  const pinnedZone     = useTerraceStore((s) => s.pinnedZone);
  const setPinnedZone  = useTerraceStore((s) => s.setPinnedZone);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const CARD_W    = isMobile ? 88  : 128;
  const CARD_MARGIN = isMobile ? 4   : 8;
  const FONT_VAL  = isMobile ? '1.1rem' : '1.55rem';
  const FONT_LABEL = isMobile ? '0.42rem' : '0.5rem';
  const FONT_SUB  = isMobile ? '0.44rem' : '0.52rem';

  const revealedList = ZONES.filter((z) => revealedZones.has(z.id));

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>

      {/* ── Connector lines overlay ─────────────────────────────────────────── */}
      {/* Drawn behind the cards in a single SVG; viewBox 0-100 with none AR */}
      <svg
        style={{
          position:      'absolute',
          inset:         0,
          width:         '100%',
          height:        '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {revealedList.map((zone) => {
          const isPinned   = pinnedZone === zone.id;
          const isLeft     = zone.side === 'left';
          const cardEdgeX  = isLeft ? LEFT_CARD_X : RIGHT_CARD_X;
          // Card midpoint Y: top% + estimated half-card-height (~8% of canvas)
          const cardMidY   = parseFloat(zone.top) + 8;
          const [ax, ay]   = zone.anchor;

          return (
            <line
              key={zone.id}
              x1={cardEdgeX} y1={cardMidY}
              x2={ax}        y2={ay}
              stroke={kitPrimary}
              strokeWidth={isPinned ? 0.5 : 0.3}
              strokeDasharray="1.5 1.2"
              opacity={isPinned ? 0.55 : 0.25}
            />
          );
        })}
      </svg>

      {/* ── Zone cards ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {ZONES.map((zone, i) => {
          if (!revealedZones.has(zone.id)) return null;
          const { value, sub } = zone.primary(player, detail);
          const isPinned = pinnedZone === zone.id;
          const isLeft   = zone.side === 'left';

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: isLeft ? -14 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLeft ? -14 : 14 }}
              transition={{ duration: 0.32, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position:      'absolute',
                top:           zone.top,
                ...(isLeft ? { left: CARD_MARGIN } : { right: CARD_MARGIN }),
                width:         CARD_W,
                pointerEvents: 'auto',
                cursor:        'pointer',
              }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => setPinnedZone(pinnedZone === zone.id ? null : zone.id)}
            >
              <div
                style={{
                  // Slim card: left-border accent, no full border box
                  background:     isPinned
                    ? `rgba(${hexRgb(kitPrimary)}, 0.14)`
                    : 'rgba(8, 8, 16, 0.88)',
                  borderLeft:     `3px solid ${kitPrimary}`,
                  borderTop:      `1px solid ${kitPrimary}${isPinned ? '44' : '22'}`,
                  borderRight:    `1px solid ${kitPrimary}${isPinned ? '44' : '22'}`,
                  borderBottom:   `1px solid ${kitPrimary}${isPinned ? '44' : '22'}`,
                  borderRadius:   '0 4px 4px 0',
                  padding:        '8px 10px 8px 9px',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                {/* Zone label — small caps */}
                <div style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      FONT_LABEL,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontVariant:   'small-caps',
                  color:         'rgba(180, 195, 220, 0.75)',
                  marginBottom:  5,
                  display:       'flex',
                  justifyContent:'space-between',
                  alignItems:    'center',
                }}>
                  <span>{zone.label}</span>
                  {/* Pin dot */}
                  <span style={{
                    display:      'inline-block',
                    width:        5,
                    height:       5,
                    borderRadius: '50%',
                    background:   isPinned ? kitPrimary : 'transparent',
                    border:       `1px solid ${kitPrimary}88`,
                    marginLeft:   4,
                  }} />
                </div>

                {/* Primary stat — large and prominent */}
                <div style={{
                  fontFamily:  'var(--font-mono)',
                  fontSize:    FONT_VAL,
                  fontWeight:  800,
                  color:       '#f0f0f0',
                  lineHeight:  1.1,
                  letterSpacing: '-0.02em',
                  wordBreak:   'break-word',
                }}>
                  {value}
                </div>

                {/* Sub info */}
                <div style={{
                  fontFamily:  'var(--font-mono)',
                  fontSize:    FONT_SUB,
                  color:       '#7788aa',
                  marginTop:   4,
                  lineHeight:  1.3,
                  wordBreak:   'break-word',
                }}>
                  {sub}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function hexRgb(hex: string): string {
  const c = hex.replace('#', '');
  return `${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}`;
}
