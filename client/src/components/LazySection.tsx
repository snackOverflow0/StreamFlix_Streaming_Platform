"use client";
import ScrollFade from "./ScrollFade";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function LazySection({
  children,
  minHeight = 320,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || visible) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={markerRef}
      style={visible ? undefined : { minHeight }}
      aria-busy={!visible}
    >
      {visible ? <ScrollFade>{children}</ScrollFade> : null}
    </div>
  );
}
