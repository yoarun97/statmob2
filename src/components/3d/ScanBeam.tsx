import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScanBeamProps {
  onZoneReveal: (zone: string) => void;
  onComplete: () => void;
}

// World-space Y thresholds matching the scaled mannequin (group scale 2.5,
// model bbox Y roughly -1.05 to 1.25 in world space).
const ZONE_BOUNDARIES = [
  { zone: 'profile', y:  1.0 },  // head / identity
  { zone: 'engine',  y: -0.2 },  // legs / engine
  { zone: 'record',  y: -0.7 },  // ball / goal record
  { zone: 'career',  y: -1.0 },  // pedestal / career
] as const;

const START_Y      =  1.45;
const END_Y        = -1.2;
const SCAN_DURATION = 1.8;
const FADE_DURATION = 0.3;

export function ScanBeam({ onZoneReveal, onComplete }: ScanBeamProps) {
  const meshRef     = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed     = useRef(0);
  const emitted     = useRef(new Set<string>());
  const completed   = useRef(false);
  const fading      = useRef(false);
  const fadeElapsed = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    if (completed.current) return;

    elapsed.current += delta;

    if (!fading.current) {
      const t        = Math.min(elapsed.current / SCAN_DURATION, 1);
      const currentY = START_Y + (END_Y - START_Y) * t;
      meshRef.current.position.y = currentY;

      for (const { zone, y } of ZONE_BOUNDARIES) {
        if (!emitted.current.has(zone) && currentY <= y) {
          emitted.current.add(zone);
          onZoneReveal(zone);
        }
      }

      if (t >= 1) fading.current = true;
    } else {
      fadeElapsed.current += delta;
      const opacity = Math.max(0, 0.6 * (1 - fadeElapsed.current / FADE_DURATION));
      materialRef.current.opacity = opacity;

      if (fadeElapsed.current >= FADE_DURATION && !completed.current) {
        completed.current = true;
        onComplete();
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, START_Y, 0]}>
      <cylinderGeometry args={[0.82, 0.82, 0.025, 64]} />
      <meshBasicMaterial ref={materialRef} color="#00A855" transparent opacity={0.6} />
    </mesh>
  );
}
