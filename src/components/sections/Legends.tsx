import { EditorialSection } from '@/components/layout/EditorialSection';

export function Legends() {
  return (
    <EditorialSection
      id="legends"
      className="min-h-screen flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <p
        className="text-sm font-semibold tracking-[0.18em] uppercase mb-4 opacity-70"
        style={{ fontFamily: 'var(--font-mono)', color: 'inherit' }}
      >
        05 / Legends
      </p>
      <h2
        className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
        style={{ color: 'inherit' }}
      >
        The greats.<br />By the numbers.
      </h2>
      <p className="text-base max-w-md opacity-50" style={{ color: 'inherit' }}>
        Hall of fame deep-dives: career arcs, peak seasons, and legacy stats. Legends take their time.
      </p>
    </EditorialSection>
  );
}
