import { useCallback } from 'react';
import { StadiumSection } from '@/components/layout/StadiumSection';
import { StadiumCanvas } from '@/components/3d/StadiumCanvas';

export default function Hero() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleSettled = useCallback(() => {}, []);

  return (
    <StadiumSection id="hero" className="relative min-h-screen overflow-hidden">
      {/* Daylight sky behind the transparent canvas */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #a8cfe8 0%, #cce4f0 50%, #ddf0f8 100%)' }}
      />

      {/* 3D stadium — full bleed, interactive after cinematic */}
      <div className="absolute inset-0">
        <StadiumCanvas onSettled={handleSettled} />
      </div>

      {/* Subtle bottom fade into site dark background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 65%, rgba(10,10,15,0.35) 85%, #0a0a0f 100%)',
        }}
      />
    </StadiumSection>
  );
}
