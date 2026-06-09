"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following aurora glow for the hero.
 *
 * Soft teal/coral light blobs lerp toward the pointer at staggered speeds for a
 * trailing "aurora" feel. When the pointer is idle (or on touch devices) the
 * blobs fall back to a slow ambient drift. Honours `prefers-reduced-motion` by
 * rendering the blobs static. Positions animate via left/top percentages so the
 * server-rendered markup already matches the initial state (no first-paint flash)
 * and everything stays correct relative to the hero container on resize.
 */

type BlobSpec = {
  hue: "primary" | "accent" | "mix";
  className: string;
  /** initial normalized position (0..1) within the hero */
  x: number;
  y: number;
  /** lerp factor — higher = follows the cursor more eagerly (front of the trail) */
  speed: number;
};

const BLOBS: BlobSpec[] = [
  { hue: "primary", className: "size-[44vw] max-w-[660px] opacity-55", x: 0.5, y: 0.4, speed: 0.09 },
  { hue: "accent", className: "size-[34vw] max-w-[520px] opacity-50", x: 0.4, y: 0.56, speed: 0.06 },
  { hue: "mix", className: "size-[26vw] max-w-[420px] opacity-40", x: 0.62, y: 0.34, speed: 0.035 },
];

const FILL: Record<BlobSpec["hue"], string> = {
  primary:
    "radial-gradient(circle, color-mix(in oklch, var(--primary) 55%, transparent), transparent 65%)",
  accent:
    "radial-gradient(circle, color-mix(in oklch, var(--accent) 55%, transparent), transparent 65%)",
  mix: "radial-gradient(circle, color-mix(in oklch, var(--primary) 50%, var(--accent)), transparent 62%)",
};

export function HeroAurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const section = root.parentElement ?? root;
    const blobs = Array.from(root.querySelectorAll<HTMLElement>("[data-blob]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = BLOBS.map((b) => ({ x: b.x, y: b.y }));

    if (reduce) return; // leave blobs at their static initial positions

    let targetX = 0.5;
    let targetY = 0.42;
    let active = false;
    let raf = 0;
    let t = 0;

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width;
      targetY = (e.clientY - r.top) / r.height;
      active = true;
    };
    const onLeave = () => {
      active = false;
    };

    const frame = () => {
      t += 0.006;
      // Ambient figure-eight drift used while the pointer is idle.
      const ambientX = 0.5 + Math.cos(t) * 0.2;
      const ambientY = 0.42 + Math.sin(t * 0.9) * 0.16;
      const gx = active ? targetX : ambientX;
      const gy = active ? targetY : ambientY;

      state.forEach((s, i) => {
        s.x += (gx - s.x) * BLOBS[i].speed;
        s.y += (gy - s.y) * BLOBS[i].speed;
        const b = blobs[i];
        b.style.left = `${s.x * 100}%`;
        b.style.top = `${s.y * 100}%`;
      });
      raf = requestAnimationFrame(frame);
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          data-blob
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl will-change-[left,top] ${b.className}`}
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            background: FILL[b.hue],
          }}
        />
      ))}
    </div>
  );
}
