import { useEffect, useRef } from 'react';

/**
 * When the app is CSS-rotated 90deg (portrait media query),
 * physical vertical swipes don't map to overflow-y scroll.
 * This hook intercepts touch events and translates them.
 */
export function useRotatedScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const isRotated = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    const update = () => { isRotated.current = mql.matches; };
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startY = 0;
    let startScrollTop = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!isRotated.current) return;
      startY = e.touches[0].clientY;
      startScrollTop = el.scrollTop;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isRotated.current) return;
      e.preventDefault();
      const deltaY = e.touches[0].clientY - startY;
      el.scrollTop = startScrollTop - deltaY;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [containerRef]);
}
