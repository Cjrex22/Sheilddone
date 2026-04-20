import { useEffect, useRef, useCallback } from 'react';
import { useSosStore } from '../stores/sosStore';

export function useShakeDetection(onShakeConfirmed: () => void) {
  const breachTimestampsRef = useRef<number[]>([]);
  const cooldownActiveRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenerAttachedRef = useRef(false);
  const onShakeConfirmedRef = useRef(onShakeConfirmed);

  // Keep callback ref fresh without re-attaching listener
  useEffect(() => {
    onShakeConfirmedRef.current = onShakeConfirmed;
  }, [onShakeConfirmed]);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    // Guard 3: cooldown active
    if (cooldownActiveRef.current) return;

    // Guard 1: feature disabled
    const { shakeToSosEnabled, sosActive } = useSosStore.getState();
    if (!shakeToSosEnabled) return;

    // Guard 2: SOS already running
    if (sosActive) return;

    // Prefer event.acceleration (excludes gravity, ~0 at rest)
    // Fallback to accelerationIncludingGravity (~9.8 at rest)
    const accelPure = event.acceleration;
    const accelGravity = event.accelerationIncludingGravity;

    let magnitude: number;
    let threshold: number;

    if (accelPure && accelPure.x != null && accelPure.y != null && accelPure.z != null) {
      // Pure acceleration — excludes gravity, rests at ~0
      magnitude = Math.sqrt(
        (accelPure.x ** 2) + (accelPure.y ** 2) + (accelPure.z ** 2)
      );
      threshold = 15; // Moderate shake on pure acceleration
    } else if (accelGravity && accelGravity.x != null && accelGravity.y != null && accelGravity.z != null) {
      // Includes gravity — rests at ~9.8
      magnitude = Math.sqrt(
        (accelGravity.x ** 2) + (accelGravity.y ** 2) + (accelGravity.z ** 2)
      );
      threshold = 25; // Higher threshold to compensate for gravity baseline
    } else {
      // No usable data from this frame
      return;
    }

    const WINDOW_MS = 800;    // Slightly wider window for reliability
    const REQUIRED_BREACHES = 3;

    if (magnitude > threshold) {
      const now = Date.now();
      breachTimestampsRef.current.push(now);

      // Purge entries older than WINDOW_MS
      breachTimestampsRef.current = breachTimestampsRef.current.filter(
        (t) => now - t <= WINDOW_MS
      );

      console.log(`[SHEild Shake] Breach! mag=${magnitude.toFixed(1)} thresh=${threshold} count=${breachTimestampsRef.current.length}/${REQUIRED_BREACHES}`);

      if (breachTimestampsRef.current.length >= REQUIRED_BREACHES) {
        // CONFIRMED SHAKE
        console.log('[SHEild Shake] ✅ SHAKE CONFIRMED — triggering overlay');
        breachTimestampsRef.current = [];
        cooldownActiveRef.current = true;

        cooldownTimerRef.current = setTimeout(() => {
          cooldownActiveRef.current = false;
        }, 4000);

        onShakeConfirmedRef.current();
      }
    }
  }, []);

  const attachListener = useCallback(() => {
    if (!listenerAttachedRef.current) {
      window.addEventListener('devicemotion', handleMotion);
      listenerAttachedRef.current = true;
      useSosStore.getState().setShakeListening(true);
      console.log('[SHEild Shake] 🎧 Listener attached');
    }
  }, [handleMotion]);

  const detachListener = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    listenerAttachedRef.current = false;
    useSosStore.getState().setShakeListening(false);
  }, [handleMotion]);

  const requestPermission = useCallback(async (): Promise<void> => {
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') return;
    try {
      const result = await (DeviceMotionEvent as any).requestPermission();
      if (result === 'granted') {
        useSosStore.getState().setPermissionState('granted');
        attachListener();
      } else {
        useSosStore.getState().setPermissionState('denied');
        detachListener();
      }
    } catch {
      useSosStore.getState().setPermissionState('denied');
    }
  }, [attachListener, detachListener]);

  // Mount: detect permission state and attach listener if possible
  useEffect(() => {
    const store = useSosStore.getState();

    if (typeof DeviceMotionEvent === 'undefined') {
      store.setPermissionState('unsupported');
      console.log('[SHEild Shake] ❌ DeviceMotionEvent undefined — unsupported');
      return;
    }

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      // iOS 13+ — do NOT auto-request
      store.setPermissionState('prompt');
      console.log('[SHEild Shake] 📱 iOS detected — waiting for user permission');
    } else {
      // Android / desktop — attach immediately
      store.setPermissionState('granted');
      attachListener();
      console.log('[SHEild Shake] ✅ Android/Desktop — auto-attached');
    }

    return () => {
      detachListener();
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [attachListener, detachListener]);

  return { requestPermission };
}
