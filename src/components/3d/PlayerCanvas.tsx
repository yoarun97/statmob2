import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Isolated R3F canvas that never re-renders from outside state changes.
// All 3D scene logic lives inside this boundary — never bleed Three.js
// context into the main React tree.

interface PlayerCanvasProps {
  className?: string;
}

// Placeholder scene — swap with actual player model when ready
function PlayerMesh() {
  return (
    <mesh>
      <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
      <meshStandardMaterial color="#00ff87" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

export function PlayerCanvas({ className }: PlayerCanvasProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <PlayerMesh />
          <OrbitControls enableZoom={false} enablePan={false} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
