import { useEffect, useRef, useState } from "react";

interface Props {
  value: number | null;
  decimals?: number;
  /** shown when value is null */
  placeholder?: string;
}

/** Tweens a numeric readout toward its new value (rAF); instant if null or reduced-motion. */
export function AnimatedNumber({ value, decimals = 2, placeholder = "––.––" }: Props) {
  const [display, setDisplay] = useState<number | null>(value);
  const fromRef = useRef<number>(value ?? 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (value == null) {
      setDisplay(null);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || display == null) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 600;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (display == null) return <>{placeholder}</>;
  return <>{display.toFixed(decimals)}</>;
}
