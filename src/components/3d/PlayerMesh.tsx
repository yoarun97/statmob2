import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTerraceStore } from '@/lib/store';
import { darken } from '@/lib/clubColors';

interface PlayerMeshProps {
  hasPlayer: boolean;
  kitPrimary: string;
  kitSecondary: string;
}

// Stable material instances — updated imperatively to avoid full scene re-clones.

const bodyMat = new THREE.MeshStandardMaterial({
  color:             new THREE.Color('#5a5a7a'),
  roughness:         0.7,
  metalness:         0.1,
  emissive:          new THREE.Color('#1a1a3a'),
  emissiveIntensity: 0.15,
});

// jerseyMat / shortsMat start dark; updated to kit colors in useEffect
const jerseyMat = new THREE.MeshStandardMaterial({
  color:             new THREE.Color('#252535'),
  roughness:         0.75,
  metalness:         0.05,
  emissive:          new THREE.Color('#252535'),
  emissiveIntensity: 0,
});

const shortsMat = new THREE.MeshStandardMaterial({
  color:             new THREE.Color('#252535'),
  roughness:         0.75,
  metalness:         0.05,
  emissive:          new THREE.Color('#252535'),
  emissiveIntensity: 0,
});

const pedestalMat = new THREE.MeshStandardMaterial({
  color:             new THREE.Color('#111118'),
  roughness:         0.3,
  metalness:         0.6,
  emissive:          new THREE.Color('#334455'), // updated to kit color in useEffect
  emissiveIntensity: 0,
});

// Ball is white — receives light and glows in kit color when GOALS zone is active
const ballMat = new THREE.MeshStandardMaterial({
  color:             new THREE.Color('#e8e8e8'),
  roughness:         0.55,
  metalness:         0.05,
  emissive:          new THREE.Color('#334455'), // updated to kit color in useEffect
  emissiveIntensity: 0,
});

export function PlayerMesh({ hasPlayer, kitPrimary, kitSecondary }: PlayerMeshProps) {
  const { scene } = useGLTF('/models/player.glb');
  const ballRef   = useRef<THREE.Mesh>(null);

  // Update all kit-reactive material colors imperatively
  useEffect(() => {
    if (hasPlayer) {
      jerseyMat.color.set(kitPrimary);
      jerseyMat.emissive.set(kitPrimary);
      shortsMat.color.set(darken(kitPrimary, 0.65));
      shortsMat.emissive.set(kitPrimary);
    } else {
      jerseyMat.color.set('#252535');
      jerseyMat.emissive.set('#252535');
      shortsMat.color.set('#252535');
      shortsMat.emissive.set('#252535');
    }
    // Pedestal and ball glow in kit color too
    pedestalMat.emissive.set(kitPrimary);
    ballMat.emissive.set(kitPrimary);
  }, [hasPlayer, kitPrimary, kitSecondary]);

  // Clone once on mount; assign kit materials by explicit name or spatial Y fallback.
  // The spatial fallback handles arbitrary GLB mesh names after compression/rename.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bbox  = new THREE.Box3();

    // Gather all visible meshes
    const meshes: THREE.Mesh[] = [];
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const n = mesh.name;
      // Original GLB ball — we render our own sphere
      if (n === 'Object_3' || n === 'Object_0') { mesh.visible = false; return; }
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      meshes.push(mesh);
    });

    // Compute bounding-box center Y for each mesh (model-local space)
    const centerYs = meshes.map((m) => {
      bbox.setFromObject(m);
      return (bbox.min.y + bbox.max.y) / 2;
    });

    const minY  = Math.min(...centerYs);
    const maxY  = Math.max(...centerYs);
    const range = (maxY - minY) || 1;

    if (import.meta.env.DEV) {
      console.log('[PlayerMesh] meshes:', meshes.map((m, i) =>
        `${m.name} centerY=${centerYs[i]?.toFixed(3)}`));
    }

    for (let i = 0; i < meshes.length; i++) {
      const mesh  = meshes[i];
      const n     = mesh.name;
      const lower = n.toLowerCase();

      // Explicit name matching for known model variants
      const isJersey =
        n === 'Mesh_B0CKXYRQZ6' || n === 'mesh_1837' ||
        lower.includes('jersey') || lower.includes('shirt') || lower.includes('b0ckx');
      const isShorts =
        n === 'Mesh_B0CKXYRQZ6_K_M' || n === 'mesh_454' ||
        lower.includes('shorts') || lower.includes('pant') || lower.includes('k_m');

      if (isJersey) { mesh.material = jerseyMat; continue; }
      if (isShorts) { mesh.material = shortsMat; continue; }

      // Spatial fallback: divide model height into zones.
      // Upper 55% → jersey (torso, arms, shoulders), 15–55% → shorts, <15% → body (boots)
      const relY = (centerYs[i] - minY) / range;
      if      (relY > 0.45) mesh.material = jerseyMat;
      else if (relY > 0.15) mesh.material = shortsMat;
      else                  mesh.material = bodyMat;
    }

    return clone;
  }, [scene]);

  // Lerp emissive intensities per frame. Pinned zone takes priority over hovered.
  // Uses getState() — not a React hook — so it never triggers re-renders.
  useFrame(({ clock }) => {
    const { hoveredZone, pinnedZone } = useTerraceStore.getState();
    const active = pinnedZone ?? hoveredZone;
    const t      = clock.getElapsedTime();
    const LERP   = 0.08;
    const pulse  = 0.1 * Math.sin(t * 4.2);

    // Pinned zones pulse more slowly and at higher base intensity
    const pinBoost = pinnedZone ? 0.1 : 0;

    const bodyTarget     = active === 'profile' ? 0.45 + pulse + pinBoost : 0.08;
    const engineTarget   = active === 'engine'  ? 0.45 + pulse + pinBoost : 0;
    const pedestalTarget = active === 'career'  ? 0.45 + pulse + pinBoost : 0;
    const ballTarget     = active === 'record'  ? 0.5  + pulse + pinBoost : 0;

    bodyMat.emissiveIntensity     += (bodyTarget     - bodyMat.emissiveIntensity)     * LERP;
    jerseyMat.emissiveIntensity   += (engineTarget   - jerseyMat.emissiveIntensity)   * LERP;
    shortsMat.emissiveIntensity   += (engineTarget   - shortsMat.emissiveIntensity)   * LERP;
    pedestalMat.emissiveIntensity += (pedestalTarget - pedestalMat.emissiveIntensity) * LERP;
    ballMat.emissiveIntensity     += (ballTarget     - ballMat.emissiveIntensity)     * LERP;
  });

  return (
    <>
      {/* Figure — scaled 2.5x, stays at world origin while camera orbits */}
      <group scale={2.5}>
        <primitive object={model} />
      </group>

      {/* Museum pedestal — attach="material" required; without it R3F defaults to lime-green */}
      <mesh position={[0, -1.075, 0]} receiveShadow material={pedestalMat}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 64]} />
      </mesh>

      {/* Club-colored spotlight pool on the floor */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 64]} />
        <meshBasicMaterial color={kitPrimary} opacity={0.15} transparent />
      </mesh>

      {/* Ball — rests on top of the plinth surface (plinth top = -1.05, ball r = 0.11) */}
      <mesh ref={ballRef} position={[0.44, -0.93, 0.36]} visible={hasPlayer} castShadow material={ballMat}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
    </>
  );
}

useGLTF.preload('/models/player.glb');
