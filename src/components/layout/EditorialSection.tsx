import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSectionSkin } from '@/lib/useSectionSkin';
import { useTerraceStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

// Transitions from stadium dark to editorial light when 15% visible.
// Once entered, never reverts. will-change is applied only during the animation
// to avoid holding GPU memory for the component's entire lifetime.
export function EditorialSection({ id, children, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { isActive, hasEnteredOnce } = useSectionSkin(ref, 'editorial');
  const [isAnimating, setIsAnimating] = useState(false);
  const setActiveSkin = useTerraceStore(s => s.setActiveSkin);

  const shouldBeLight = isActive || hasEnteredOnce;

  // Keep global skin in sync so Nav and other out-of-tree components can react
  useEffect(() => {
    setActiveSkin(isActive ? 'editorial' : 'stadium');
  }, [isActive, setActiveSkin]);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ backgroundColor: '#0a0a0f', color: '#f0f0f0' }}
      animate={{
        backgroundColor: shouldBeLight ? '#f5f2eb' : '#0a0a0f',
        color: shouldBeLight ? '#0d0d0d' : '#f0f0f0',
      }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      data-skin={shouldBeLight ? 'editorial' : undefined}
      style={{ willChange: isAnimating ? 'background-color' : 'auto' }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}
