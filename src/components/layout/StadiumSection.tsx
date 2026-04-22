import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

// Default dark skin. No transition needed — stadium is the baseline.
export function StadiumSection({ id, children, className }: Props) {
  return (
    <section
      id={id}
      className={cn('bg-[var(--bg-primary)] text-[var(--text-primary)]', className)}
    >
      {children}
    </section>
  );
}
