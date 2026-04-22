import { Suspense, useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import * as THREE from 'three';

useGLTF.setDecoderPath('/draco/');

const SCALE: [number, number, number] = [0.15, 0.15, 0.15];
const CENTER_OFFSET: [number, number, number] = [-2.09, -4.60, 2.61];

const START_POS = new THREE.Vector3(35, 30, 62);
// Corner-to-corner diagonal: camera above the Stretford-End/West corner,
// looking toward the opposite corner near the Sir Alex Ferguson (North) Stand
// Camera dropped to stand level so no sky shows — full stadium fills the frame
const END_POS   = new THREE.Vector3(-14, 6, 13);
const START_TGT = new THREE.Vector3(0, 4, 0);
// Look directly at the text so it lands at screen center
const END_TGT   = new THREE.Vector3(1, -4, -2);

const PITCH_POS: [number, number, number] = [1, -4, -2];

const SWOOP_DELAY    = 1.2;
const SWOOP_DURATION = 3.0;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();

interface SceneProps {
  onSettled: () => void;
  orbitEnabled: boolean;
}

function StadiumScene({ onSettled, orbitEnabled }: SceneProps) {
  const { scene }   = useGLTF('/models/stadium.glb');
  const settledRef  = useRef(false);
  const loadedAtRef = useRef<number | null>(null);
  const [settled, setSettled] = useState(false);

  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame(({ camera, clock }) => {
    if (settledRef.current) return;

    const t = clock.getElapsedTime();
    if (loadedAtRef.current === null) loadedAtRef.current = t;

    const local   = t - loadedAtRef.current;
    const elapsed = local - SWOOP_DELAY;
    const p       = elapsed < 0 ? 0 : Math.min(elapsed / SWOOP_DURATION, 1);
    const e       = easeInOutCubic(p);

    _pos.lerpVectors(START_POS, END_POS, e);
    _tgt.lerpVectors(START_TGT, END_TGT, e);
    camera.position.copy(_pos);
    camera.lookAt(_tgt);

    if (p >= 1) {
      settledRef.current = true;
      setSettled(true);
      onSettled();
    }
  });

  return (
    <>
      <group scale={SCALE} position={CENTER_OFFSET}>
        <primitive object={model} />
      </group>

      {settled && (
        <Html center position={PITCH_POS} distanceFactor={18} style={{ pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', userSelect: 'none', whiteSpace: 'nowrap' }}>
            <div style={{
              fontFamily:    'var(--font-body)',
              fontWeight:    800,
              fontSize:      '5rem',
              color:         '#ffffff',
              lineHeight:    1,
              letterSpacing: '-0.02em',
              textShadow:    '0 2px 28px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.3)',
            }}>
              Terrace
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize:   '1.3rem',
              color:      'rgba(255,255,255,0.9)',
              marginTop:  '0.6rem',
              textShadow: '0 1px 12px rgba(0,0,0,0.55)',
            }}>
              The Premier League, in full.
            </div>
          </div>
        </Html>
      )}

      {/* OrbitControls target is the stadium center so rotating feels natural */}
      {settled && orbitEnabled && (
        <OrbitControls
          makeDefault
          target={[1, -4, -2]}
          enableDamping
          dampingFactor={0.06}
          minPolarAngle={0}
          maxPolarAngle={Math.PI * 0.48}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.7}
        />
      )}
    </>
  );
}

export function StadiumCanvas({ onSettled }: { onSettled: () => void }) {
  const [settled, setSettled]           = useState(false);
  const [orbitEnabled, setOrbitEnabled] = useState(false);

  const handleSettled = useCallback(() => {
    setSettled(true);
    onSettled();
  }, [onSettled]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [35, 30, 62], fov: 55 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={2.8} />
        <directionalLight position={[50, 100, 50]} intensity={0.8} />

        <Suspense fallback={null}>
          <StadiumScene onSettled={handleSettled} orbitEnabled={orbitEnabled} />
        </Suspense>
      </Canvas>

      {/* Orbit toggle button — appears after cinematic, bottom-right corner */}
      <AnimatePresence>
        {settled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom:   28,
              right:    28,
              zIndex:   20,
              width:    130,
              height:   80,
            }}
          >
            {/* "try this" annotation */}
            <AnimatePresence>
              {!orbitEnabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="hidden sm:block"
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                >
                  <svg width="130" height="80" viewBox="0 0 130 80" fill="none">
                    <text
                      x="6" y="18"
                      fill="rgba(255,255,255,0.75)"
                      fontSize="12"
                      fontStyle="italic"
                      fontFamily="Georgia, 'Times New Roman', serif"
                      transform="rotate(-5 6 18)"
                    >
                      try this
                    </text>
                    <path
                      d="M 62,22 C 78,38 98,50 111,61"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 104,56 L 111,61 L 105,61"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Globe button */}
            <button
              onClick={() => setOrbitEnabled(v => !v)}
              title={orbitEnabled ? 'Exit explore mode' : 'Explore stadium'}
              style={{
                position:       'absolute',
                bottom:         0,
                right:          0,
                width:          38,
                height:         38,
                borderRadius:   '50%',
                border:         `1px solid ${orbitEnabled ? 'rgba(0,255,135,0.55)' : 'rgba(255,255,255,0.22)'}`,
                background:     orbitEnabled ? 'rgba(0,255,135,0.14)' : 'rgba(8,8,18,0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color:          orbitEnabled ? '#00ff87' : 'rgba(255,255,255,0.72)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         'pointer',
                transition:     'border-color 0.2s, background 0.2s, color 0.2s',
              }}
            >
              <Globe size={16} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

useGLTF.preload('/models/stadium.glb');
