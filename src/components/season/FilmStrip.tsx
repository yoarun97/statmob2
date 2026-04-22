import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAllSeasons } from '@/hooks/useAllSeasons';
import { useTerraceStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const FRAME_H    = 72;
const SPROCKET_W = 18;   // width of each sprocket column
const MAX_ROTATE_X = 34;

// Sprocket holes: 8×12px, rx 4px, outlined — no fill, dark border.
// Simulates physical 35mm perforations punched through the film base.
const makeSprocketPattern = () => {
  const hx = (SPROCKET_W - 8) / 2;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SPROCKET_W}" height="22">`,
    `<rect x="${hx}" y="5" width="8" height="12" rx="4"`,
    ` fill="none" stroke="rgba(13,13,13,0.28)" stroke-width="1"/>`,
    `</svg>`,
  ].join('');
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const SPROCKET_PATTERN = makeSprocketPattern();

export function FilmStrip() {
  const rawSeasons = useAllSeasons();
  // Newest first — user scrolls back in time
  const seasons = [...rawSeasons].reverse();
  const { activeSeason, setActiveSeason } = useTerraceStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex  = seasons.findIndex(s => s.season === activeSeason);

  const [scrollTop,       setScrollTop]       = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (el) setContainerHeight(el.clientHeight);
  }, []);

  // Centre the active frame in the reel on season change
  useEffect(() => {
    const el = containerRef.current;
    if (!el || activeIndex === -1) return;
    const offset = activeIndex * FRAME_H - el.clientHeight / 2 + FRAME_H / 2;
    el.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }, [activeSeason, activeIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Drum-reel: frames away from the centre viewport rotate away on their axis
  const getReelStyle = (i: number): React.CSSProperties => {
    const itemCY = i * FRAME_H + FRAME_H / 2;
    const viewCY = scrollTop + containerHeight / 2;
    const ratio  = Math.max(-1, Math.min(1, (itemCY - viewCY) / (containerHeight / 2)));
    return {
      transform:       `perspective(500px) rotateX(${-(ratio * MAX_ROTATE_X)}deg) scale(${1 - Math.abs(ratio) * 0.18})`,
      transformOrigin: 'center center',
    };
  };

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        // Dark projector-housing frame sits against the cream section background
        boxShadow: 'inset 0 0 0 4px #1a1a1a, inset 0 0 18px rgba(0,0,0,0.10)',
      }}
    >
      {/* Left sprocket column */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width:               SPROCKET_W,
          backgroundImage:     SPROCKET_PATTERN,
          backgroundRepeat:    'repeat-y',
          backgroundPositionY: '8px',
        }}
      />

      {/* Right sprocket column */}
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width:               SPROCKET_W,
          backgroundImage:     SPROCKET_PATTERN,
          backgroundRepeat:    'repeat-y',
          backgroundPositionY: '8px',
        }}
      />

      {/* Hairline dividers between sprocket strips and content area */}
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: SPROCKET_W, width: 1, background: 'rgba(13,13,13,0.12)' }} />
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ right: SPROCKET_W, width: 1, background: 'rgba(13,13,13,0.12)' }} />

      {/* Top fade — cream so the list dissolves into the section background */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: 80, background: 'linear-gradient(to bottom, #f5f2eb 15%, transparent)' }}
      />

      {/* Scrollable frame list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-20"
        style={{ scrollbarWidth: 'none' }}
        onScroll={handleScroll}
      >
        {seasons.map((entry, i) => {
          const isActive = entry.season === activeSeason;
          return (
            <motion.button
              key={entry.season}
              onClick={() => setActiveSeason(entry.season)}
              className={cn(
                'w-full text-left flex items-center focus-visible:outline-none',
                isActive
                  ? 'text-[var(--editorial-text)]'
                  : 'text-[var(--editorial-secondary)] hover:text-[var(--editorial-text)]',
              )}
              style={{
                height:      FRAME_H,
                paddingLeft:  SPROCKET_W + 8,
                paddingRight: SPROCKET_W + 8,
                gap: '0.5rem',
                // Full-width frame rules (border spans the full strip width)
                borderTop:   '1px solid rgba(13,13,13,0.18)',
                // Selected frame: subtle dark tint across the full frame
                background:  isActive ? 'rgba(26,26,26,0.07)' : 'transparent',
                ...getReelStyle(i),
              }}
              animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
              whileHover={{ opacity: 1, x: 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Frame counter — counts down: 01 = newest */}
              <span className="font-stats text-[0.45rem] w-4 text-right shrink-0 tabular-nums opacity-25 leading-none">
                {String(seasons.length - i).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div
                  className="font-stats tabular-nums leading-tight"
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    // Selected frame: season label grows to 1.1rem
                    fontSize:   isActive ? '1.1rem' : '0.8rem',
                    transition: 'font-size 0.2s ease',
                  }}
                >
                  {entry.season}
                </div>
                <div
                  className="text-[0.65rem] mt-0.5 truncate leading-tight"
                  // Champion name in accent green on the selected frame
                  style={{ color: isActive ? 'var(--accent)' : 'inherit', opacity: isActive ? 1 : 0.65 }}
                >
                  {entry.champion}
                </div>
              </div>

              {/* Active indicator — thin right-edge bar */}
              <motion.div
                className="shrink-0 rounded-full"
                style={{ background: 'var(--accent)', width: 2 }}
                animate={{ height: isActive ? 32 : 0, opacity: isActive ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </motion.button>
          );
        })}
        {/* Bottom frame rule after the last row */}
        <div style={{ borderTop: '1px solid rgba(13,13,13,0.18)' }} />
      </div>

      {/* Bottom fade — cream, mirrors the top */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: 80, background: 'linear-gradient(to top, #f5f2eb 15%, transparent)' }}
      />
    </div>
  );
}
