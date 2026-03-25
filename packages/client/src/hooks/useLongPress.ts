import { useRef, useCallback } from 'react';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10;

export function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const triggered = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    triggered.current = false;
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    timerRef.current = setTimeout(() => {
      triggered.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!timerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startPos.current.x);
    const dy = Math.abs(touch.clientY - startPos.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clear();
    }
  }, [clear]);

  const onTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const onClick = useCallback((e: React.MouseEvent) => {
    // Prevent the click that follows a successful long press
    if (triggered.current) {
      e.preventDefault();
      e.stopPropagation();
      triggered.current = false;
    }
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onClick };
}
