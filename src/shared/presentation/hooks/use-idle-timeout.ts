import { useState, useEffect, useCallback, useRef } from "react";

interface UseIdleTimeoutOptions {
  enabled: boolean;
  timeoutSeconds: number;
  warningSeconds: number;
  onTimeout: () => void;
}

interface UseIdleTimeoutReturn {
  showWarning: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export function useIdleTimeout({
  enabled,
  timeoutSeconds,
  warningSeconds,
  onTimeout,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningSeconds);
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemainingSeconds(warningSeconds);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!enabled) return;

    const warningDelay = (timeoutSeconds - warningSeconds) * 1000;

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(warningSeconds);

      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningDelay);
  }, [enabled, timeoutSeconds, warningSeconds, onTimeout]);

  useEffect(() => {
    if (!enabled) {
      setShowWarning(false);
      return;
    }

    resetTimers();

    const handleActivity = () => {
      // Only reset if warning is not showing
      if (!showWarning) {
        resetTimers();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, resetTimers, showWarning]);

  const onExtend = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  const onLogout = useCallback(() => {
    setShowWarning(false);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    onTimeout();
  }, [onTimeout]);

  return { showWarning, remainingSeconds, onExtend, onLogout };
}
