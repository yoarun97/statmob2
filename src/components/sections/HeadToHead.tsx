import { StadiumSection } from '@/components/layout/StadiumSection';

export function HeadToHead() {
  return (
    <StadiumSection
      id="h2h"
      className="min-h-screen flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <p
        className="text-sm font-semibold tracking-[0.18em] uppercase mb-4 text-[var(--text-primary)] opacity-70"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        04 / Head to Head
      </p>
      <h2
        className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-[var(--text-primary)]"
      >
        Pick two.<br />The data decides.
      </h2>
      <p className="text-base max-w-md text-[var(--text-secondary)]">
        Head-to-head records, goal tallies, and form comparisons. Coin toss to decide who ships first.
      </p>
    </StadiumSection>
  );
}
