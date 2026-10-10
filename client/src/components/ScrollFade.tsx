import { useEffect, useRef, useState, type ReactNode } from "react";
export default function ScrollFade({ children }: { children: ReactNode }) {
 const ref = useRef<HTMLDivElement>(null);
 const [visible, setVisible] = useState(true);
 useEffect(() => {
  if (!ref.current || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0, rootMargin: "-30px 0px" });
  observer.observe(ref.current);
  return () => observer.disconnect();
 }, []);
 return <div ref={ref} className="sf-scroll-fade" data-visible={visible}>{children}</div>;
}
