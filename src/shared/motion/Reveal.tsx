import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
  /** entrance direction: rise (default), or slide from left/right */
  from?: "up" | "left" | "right";
}

/**
 * Scroll-reveal using IntersectionObserver + the shared fade+rise transition
 * (defined in index.css as `.reveal`). Reveals once, then disconnects.
 */
export function Reveal({ children, as = "div", className, delay = 0, from = "up" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;
  const dirClass = from === "left" ? " reveal-left" : from === "right" ? " reveal-right" : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger by delaying the class flip, not via CSS transition-delay
          // (which would also delay later hover transitions on the element).
          timer = setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={`reveal${dirClass}${shown ? " in-view" : ""}${className ? " " + className : ""}`}
    >
      {children}
    </Tag>
  );
}
