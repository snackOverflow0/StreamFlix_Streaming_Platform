import { useCallback, useEffect, useRef, useState } from "react";
import type { View } from "../types";

export default function useGlideIndicator(activeId: View) {
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({});
  const [glide, setGlide] = useState({ left: 0, width: 0, visible: false });

  const moveTo = useCallback((id: View) => {
    const container = containerRef.current;
    const item = itemRefs.current[id];
    if (!container || !item) return;
    setGlide({
      left: item.offsetLeft,
      width: item.offsetWidth,
      visible: true,
    });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => moveTo(activeId));
    const reposition = () => moveTo(activeId);
    window.addEventListener("resize", reposition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", reposition);
    };
  }, [activeId, moveTo]);

  return { containerRef, itemRefs, glide, moveTo };
}
