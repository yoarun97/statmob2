import { EditorialSection } from '@/components/layout/EditorialSection';

export function Clubs() {
  return (
    <EditorialSection
      id="clubs"
      className="min-h-screen flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <p
        className="text-sm font-semibold tracking-[0.18em] uppercase mb-4 opacity-70"
        style={{ fontFamily: 'var(--font-mono)', color: 'inherit' }}
      >
        03 / Clubs
      </p>
      <h2
        className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
        style={{ color: 'inherit' }}
      >
        The 20.<br />Their stories.
      </h2>
      <p className="text-base max-w-md opacity-50" style={{ color: 'inherit' }}>
        Club profiles, historical finishes, and badge evolution. The data is warming up on the bench.
      </p>
    </EditorialSection>
  );
}
