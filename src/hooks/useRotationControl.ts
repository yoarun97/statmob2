import { useRef, useCallback } from 'react';

interface RotationControl {
  rotationY: React.MutableRefObject<number>;
  isResetting: React.MutableRefObject<boolean>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

// Drag-to-rotate with auto-reset. Shared refs let the R3F useFrame loop read
// current rotation without triggering re-renders.
export function useRotationControl(resetDelay = 2500): RotationControl {
  const rotationY   = useRef(0);
  const isResetting = useRef(false);
  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const timer       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current  = true;
    isResetting.current = false;
    lastX.current       = e.clientX;
    clearTimeout(timer.current);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    rotationY.current += dx * 0.012;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    timer.current = setTimeout(() => {
      isResetting.current = true;
    }, resetDelay);
  }, [resetDelay]);

  return { rotationY, isResetting, onPointerDown, onPointerMove, onPointerUp };
}
