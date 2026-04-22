import { StadiumSection } from '@/components/layout/StadiumSection';

export function Live() {
  return (
    <StadiumSection
      id="live"
      className="min-h-screen flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <p
        className="text-sm font-semibold tracking-[0.18em] uppercase mb-4 text-[var(--text-primary)] opacity-70"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        06 / Live
      </p>
      <h2
        className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-[var(--text-primary)]"
      >
        Right now.<br />On the pitch.
      </h2>
      <p className="text-base max-w-md text-[var(--text-secondary)]">
        Live scores, lineups, and in-match stats. Kick-off time TBD.
      </p>
    </StadiumSection>
  );
}
