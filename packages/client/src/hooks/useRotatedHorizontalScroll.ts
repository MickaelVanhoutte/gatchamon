import { useEffect, useRef } from 'react';

/**
 * When the app is CSS-rotated 90deg (portrait media query),
 * physical vertical swipes don't map to overflow-x scroll.
 * This hook intercepts touch events and translates them
 * to horizontal scroll (scrollLeft).
 */
export function useRotatedHorizontalScroll(containerRef: React.RefObject<HTMLElement | null>) {
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
    let startScrollLeft = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!isRotated.current) return;
      startY = e.touches[0].clientY;
      startScrollLeft = el.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isRotated.current) return;
      e.preventDefault();
      e.stopPropagation();
      const deltaY = e.touches[0].clientY - startY;
      el.scrollLeft = startScrollLeft + deltaY;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [containerRef]);
}
