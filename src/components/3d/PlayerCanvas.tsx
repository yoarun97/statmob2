import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { PlayerMesh } from './PlayerMesh';
import { ScanBeam } from './ScanBeam';

useGLTF.setDecoderPath('/draco/');

interface PlayerCanvasProps {
  className?: string;
  hasPlayer: boolean;
  isScanning: boolean;
  kitPrimary: string;
  kitSecondary: string;
  onZoneReveal: (zone: string) => void;
  onScanComplete: () => void;
}

// Resumes auto-rotate 3s after the user releases the model
function RotationManager() {
  const controlsRef = useRef<any>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleStart() {
    clearTimeout(timer.current);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
  }

  function handleEnd() {
    timer.current = setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    }, 3000);
  }

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      // Orbit constraints: horizontal only ±27° from eye level — museum walkthrough feel
      minPolarAngle={Math.PI * 0.35}
      maxPolarAngle={Math.PI * 0.65}
      enableZoom={false}
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.8}
      enableDamping
      dampingFactor={0.05}
      target={[0, 0.1, 0]}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

export function PlayerCanvas({
  className,
  hasPlayer,
  isScanning,
  kitPrimary,
  kitSecondary,
  onZoneReveal,
  onScanComplete,
}: PlayerCanvasProps) {
  return (
    <div className={className} style={{ background: 'linear-gradient(160deg, #0c1220 0%, #0e1530 60%, #080c1a 100%)' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 3.4], fov: 52 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* Dark-bg lighting rig: moderate ambient keeps deep-navy bg, rim lights
            separate the figure from the background without washing it out */}

        <ambientLight intensity={0.7} color="#8899cc" />

        {/* Key spot from above-front */}
        <spotLight
          position={[0, 8, 4]}
          intensity={75}
          color="#ffffff"
          angle={0.25}
          penumbra={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Front fill */}
        <pointLight position={[0, 0.5, 4.5]} intensity={12} color="#dde0ff" />

        {/* Left rim: cool blue */}
        <spotLight
          position={[-4, 4, -2]}
          intensity={22}
          color="#3355cc"
          angle={0.3}
          penumbra={0.6}
        />

        {/* Right rim: electric green accent */}
        <spotLight
          position={[4, 3, -2]}
          intensity={18}
          color="#00ff87"
          angle={0.35}
          penumbra={0.6}
        />

        {/* Uplight from pedestal level */}
        <pointLight position={[0, -0.8, 0.5]} intensity={4} color="#1a2244" />

        <RotationManager />

        <Suspense fallback={null}>
          <PlayerMesh
            hasPlayer={hasPlayer}
            kitPrimary={kitPrimary}
            kitSecondary={kitSecondary}
          />
          {isScanning && (
            <ScanBeam onZoneReveal={onZoneReveal} onComplete={onScanComplete} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
