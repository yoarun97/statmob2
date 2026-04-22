import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type SkinType = 'stadium' | 'editorial';

// Returns isActive (true once 15% of section enters viewport) and hasEnteredOnce
// (latches true on first activation, never resets, prevents reverse flash on scroll).
export function useSectionSkin(
  ref: RefObject<HTMLElement | null>,
  _skin: SkinType,
): { isActive: boolean; hasEnteredOnce: boolean } {
  const [isActive, setIsActive] = useState(false);
  const hasEnteredOnce = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = (entry?.intersectionRatio ?? 0) >= 0.15;
        if (active) hasEnteredOnce.current = true;
        setIsActive(active);
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // ref is stable across renders

  return { isActive, hasEnteredOnce: hasEnteredOnce.current };
}
