import { useState, useCallback } from 'react';

interface ScanState {
  isScanning: boolean;
  revealedZones: Set<string>;
  scanComplete: boolean;
  startScan: () => void;
  revealZone: (zone: string) => void;
  completeScan: () => void;
}

export function useScanState(): ScanState {
  const [isScanning, setIsScanning] = useState(false);
  const [revealedZones, setRevealedZones] = useState<Set<string>>(new Set());
  const [scanComplete, setScanComplete] = useState(false);

  const startScan = useCallback(() => {
    setIsScanning(true);
    setRevealedZones(new Set());
    setScanComplete(false);
  }, []);

  const revealZone = useCallback((zone: string) => {
    setRevealedZones((prev) => {
      const next = new Set(prev);
      next.add(zone);
      return next;
    });
  }, []);

  const completeScan = useCallback(() => {
    setIsScanning(false);
    setScanComplete(true);
  }, []);

  return { isScanning, revealedZones, scanComplete, startScan, revealZone, completeScan };
}
