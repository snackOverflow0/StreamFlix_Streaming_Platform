import { useEffect, type RefObject } from 'react';

/** Mouse drag for horizontal catalog strips; native touch scrolling remains enabled. */
export function useCarouselDrag(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let initialScroll = 0;
    let active = false;
    let moved = false;
    let suppressClick = false;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 ||
          (event.target as Element).closest('button, a, input, textarea, select, [role="button"]')) return;
      startX = event.clientX;
      initialScroll = el.scrollLeft;
      active = true;
      moved = false;
    };
    const move = (event: PointerEvent) => {
      if (!active) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 6) moved = true;
      if (!moved) return;
      el.classList.add('sf-is-dragging');
      el.scrollLeft = initialScroll - distance;
      event.preventDefault();
    };
    const up = () => {
      if (!active) return;
      active = false;
      el.classList.remove('sf-is-dragging');
      if (moved) {
        suppressClick = true;
        // A click following this pointerup is suppressed in the capture listener.
        window.setTimeout(() => { suppressClick = false; }, 100);
      }
    };
    const click = (event: MouseEvent) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
    };
  }, [ref]);
}
