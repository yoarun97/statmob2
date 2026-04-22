import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlayerIndex, PlayerDetail, PlayerSeasonStat } from '@/types';
import { getClubColors } from '@/lib/clubColors';

interface PlayerProfileProps {
  player: PlayerIndex;
  detail: PlayerDetail | undefined;
  kitPrimary: string;
  primaryClub: string;
}

function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const DURATION = 800;

    function tick(now: number) {
      const t    = Math.min((now - start) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return value;
}

function rollingAvg(values: number[], window = 3): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// ─── Career timeline ─────────────────────────────────────────────────────────
// Circular nodes on a spine; each node has an oversized transparent hit area
// so hover reliably fires even on the smallest (low-goal) circles.

function CareerTimeline({ seasonStats }: { seasonStats: PlayerSeasonStat[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  if (seasonStats.length === 0) return null;

  const maxGoals = Math.max(...seasonStats.map((s) => s.goals), 1);
  const MAX_R    = 11;
  const MIN_R    = 4;
  const HIT_R    = 12;
  const SPACING  = 22;
  const H        = 56;
  const CY       = 26;
  const PAD      = HIT_R + 2;
  const totalW   = PAD * 2 + (seasonStats.length - 1) * SPACING;
  const hovered  = hoveredIdx !== null ? seasonStats[hoveredIdx] : null;

  // Unique clubs in order of first appearance, for the legend
  const uniqueClubs: string[] = [];
  for (const s of seasonStats) {
    if (!uniqueClubs.includes(s.club)) uniqueClubs.push(s.club);
  }

  return (
    <div>
      {/* Scroll container is separate so the info panel below isn't clipped.
          overflow-x:auto forces overflow-y:auto per CSS spec, which clips
          absolutely-positioned children — so the tooltip goes below the SVG instead. */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          width={Math.max(totalW, 280)}
          height={H}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Spine */}
          <line
            x1={PAD} y1={CY}
            x2={PAD + (seasonStats.length - 1) * SPACING} y2={CY}
            stroke="#2a2a3a" strokeWidth={1}
          />

          {seasonStats.map((s, i) => {
            const cx    = PAD + i * SPACING;
            const r     = MIN_R + ((s.goals / maxGoals) * (MAX_R - MIN_R));
            const color = getClubColors(s.club).primary;
            const isHov = hoveredIdx === i;

            return (
              <g key={s.season}>
                <motion.circle
                  cx={cx} cy={CY} r={r}
                  fill={color}
                  opacity={isHov ? 1 : 0.78}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: isHov ? 1 : 0.78 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                {/* Oversized hit area — fill must be non-zero for pointer events */}
                <circle
                  cx={cx} cy={CY} r={HIT_R}
                  fill="rgba(0,0,0,0.01)"
                  pointerEvents="all"
                  style={{ cursor: 'default' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info panel below the timeline — avoids all overflow/clipping issues */}
      <div style={{ minHeight: 28, marginTop: 6 }}>
        {hovered ? (
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            padding:      '5px 10px',
            background:   '#1a1a2a',
            borderRadius: 4,
            fontFamily:   'var(--font-mono)',
            fontSize:     '0.65rem',
            color:        '#f0f0f0',
          }}>
            <span style={{
              display:      'inline-block',
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   getClubColors(hovered.club).primary,
              flexShrink:   0,
            }} />
            <span style={{ color: '#8899bb' }}>{hovered.season}</span>
            <span style={{ fontWeight: 700 }}>{hovered.goals}g</span>
            <span style={{ color: '#7788aa' }}>{hovered.club}</span>
          </div>
        ) : (
          /* Club color legend when nothing is hovered */
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
            {uniqueClubs.map((club) => (
              <div key={club} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width:        7,
                  height:       7,
                  borderRadius: '50%',
                  background:   getClubColors(club).primary,
                  flexShrink:   0,
                }} />
                <span style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '0.52rem',
                  color:         '#6677aa',
                  letterSpacing: '0.04em',
                }}>
                  {club}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Goals chart ─────────────────────────────────────────────────────────────
// Full-width SVG with mouse-tracking across the entire chart area.
// fill="rgba(0,0,0,0.001)" on the overlay rect ensures pointer events fire
// everywhere (fill="transparent" is unreliable in some SVG engines).

function GoalsChart({
  goalValues,
  avgValues,
  seasonStats,
  kitPrimary,
}: {
  goalValues: number[];
  avgValues: number[];
  seasonStats: PlayerSeasonStat[];
  kitPrimary: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const n      = goalValues.length;

  if (n < 2) return null;

  const VW  = 500;
  const VH  = 96;
  const PT  = 8;
  const PB  = 8;
  const PL  = 0;
  const PR  = 0;
  const CW  = VW - PL - PR;
  const CH  = VH - PT - PB;

  const maxG = Math.max(...goalValues);

  function xOf(i: number) { return PL + (i / (n - 1)) * CW; }
  function yOf(v: number) { return PT + CH - (v / (maxG || 1)) * CH; }

  const goalsPath = goalValues.map((v, i) =>
    `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
  const avgPath = avgValues.map((v, i) =>
    `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
  const fillClose = ` L${xOf(n - 1).toFixed(1)},${VH} L${PL},${VH} Z`;

  const gradId = 'gchart-fill';

  function handleMouseMove(e: React.MouseEvent<SVGRectElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VW;
    const idx  = Math.min(n - 1, Math.max(0, Math.round(((svgX - PL) / CW) * (n - 1))));
    setHoverIdx(idx);
  }

  const hov = hoverIdx !== null ? {
    x:      xOf(hoverIdx),
    y:      yOf(goalValues[hoverIdx]),
    season: seasonStats[hoverIdx]?.season ?? '',
    goals:  goalValues[hoverIdx] ?? 0,
    avg:    (avgValues[hoverIdx] ?? 0).toFixed(1),
  } : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip — rendered above the SVG, pointer-events:none so it doesn't block */}
      {hov && (
        <div style={{
          position:      'absolute',
          top:           0,
          left:          `${(hov.x / VW) * 100}%`,
          transform:     'translateX(-50%) translateY(-110%)',
          background:    'rgba(10,10,20,0.97)',
          border:        `1px solid ${kitPrimary}55`,
          borderRadius:  5,
          padding:       '5px 10px',
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.65rem',
          color:         '#f0f0f0',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          zIndex:        10,
        }}>
          <span style={{ color: kitPrimary, fontWeight: 700 }}>{hov.goals}g</span>
          <span style={{ color: '#8899bb', margin: '0 6px' }}>{hov.season}</span>
          <span style={{ color: '#4466ee' }}>avg {hov.avg}</span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height={VH}
        style={{ display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient fill: kit color fading to transparent — reads cleanly on dark bg */}
          <linearGradient id={gradId} x1="0" y1={PT} x2="0" y2={VH} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={kitPrimary} stopOpacity={0.45} />
            <stop offset="100%" stopColor={kitPrimary} stopOpacity={0}    />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path d={`${goalsPath}${fillClose}`} fill={`url(#${gradId})`} />

        {/* Goals line */}
        <path
          d={goalsPath}
          fill="none"
          stroke={kitPrimary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 3-season rolling average — dashed */}
        <path
          d={avgPath}
          fill="none"
          stroke="#4466ee"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="5 3"
          opacity={0.75}
        />

        {/* Hover: vertical rule + dot */}
        {hov && (
          <>
            <line
              x1={hov.x} y1={PT}
              x2={hov.x} y2={VH - PB}
              stroke="#ffffff" strokeWidth={0.8} opacity={0.2}
            />
            <circle
              cx={hov.x} cy={hov.y} r={4.5}
              fill={kitPrimary}
              stroke="#0a0a12" strokeWidth={1.5}
            />
          </>
        )}

        {/* Mouse tracking rect — fill must be non-"none" for pointer events to fire */}
        <rect
          x={0} y={0} width={VW} height={VH}
          fill="rgba(0,0,0,0.001)"
          style={{ cursor: 'crosshair', pointerEvents: 'all' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        />
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 2.5, background: kitPrimary, borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#7788aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Goals</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width={18} height={8} style={{ flexShrink: 0 }}>
            <line x1={0} y1={4} x2={18} y2={4} stroke="#4466ee" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.75} />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#7788aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>3-season avg</span>
        </div>
      </div>
    </div>
  );
}

// ─── PlayerProfile ────────────────────────────────────────────────────────────

export function PlayerProfile({ player, detail, kitPrimary, primaryClub }: PlayerProfileProps) {
  const seasonStats = detail?.seasonStats ?? [];

  const peak = seasonStats.reduce<{ season: string; goals: number } | null>((best, s) => {
    if (!best || s.goals > best.goals) return s;
    return best;
  }, null);

  const clubCount = detail
    ? Array.from(new Set(seasonStats.map((s) => s.club))).length
    : 1;

  const goalsCount = useCountUp(player.goals);
  const peakCount  = useCountUp(peak?.goals ?? 0);
  const clubsCount = useCountUp(clubCount);

  const goalValues = seasonStats.map((s) => s.goals);
  const avgValues  = rollingAvg(goalValues, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Player header */}
      <div style={{ borderLeft: `4px solid ${kitPrimary}`, paddingLeft: 16 }}>
        <div style={{
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
          fontSize:   '2rem',
          fontWeight: 800,
          color:      '#f0f0f0',
          lineHeight: 1.05,
        }}>
          {player.name}
        </div>
        <div style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.7rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color:         kitPrimary,
          marginTop:     5,
        }}>
          {primaryClub}
        </div>
      </div>

      {/* Career timeline */}
      {seasonStats.length > 0 && (
        <div style={{
          background:   '#141422',
          borderRadius: 6,
          padding:      '12px 14px',
        }}>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.6rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         '#6677aa',
            marginBottom:  10,
          }}>
            Career timeline
          </div>
          <CareerTimeline seasonStats={seasonStats} />
        </div>
      )}

      {/* Hero stats */}
      <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Goals',  value: goalsCount, sub: undefined },
          { label: 'Peak Season',  value: peakCount,  sub: peak?.season },
          { label: 'Clubs Served', value: clubsCount, sub: undefined },
        ].map(({ label, value, sub }, i) => (
          <div
            key={label}
            style={{
              flex:          1,
              minWidth:      90,
              padding:       '14px 0',
              borderRight:   i < 2 ? '1px solid #1e1e2e' : 'none',
              paddingLeft:   i > 0 ? 20 : 0,
              paddingRight:  i < 2 ? 20 : 0,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '2.6rem',
              fontWeight: 800,
              color:      '#f0f0f0',
              lineHeight: 1,
            }}>
              {value}
            </div>
            {sub && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   '0.62rem',
                color:      '#8899bb',
                marginTop:  3,
              }}>
                {sub}
              </div>
            )}
            <div style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.6rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         '#556688',
              marginTop:     sub ? 1 : 6,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Goals chart */}
      {goalValues.length > 2 && (
        <div style={{
          background:   '#141422',
          borderRadius: 6,
          padding:      '12px 14px',
        }}>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.6rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         '#6677aa',
            marginBottom:  10,
          }}>
            Goals by season
          </div>
          <GoalsChart
            goalValues={goalValues}
            avgValues={avgValues}
            seasonStats={seasonStats}
            kitPrimary={kitPrimary}
          />
        </div>
      )}
    </div>
  );
}
