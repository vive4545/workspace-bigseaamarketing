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

export function HeroAurora({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return; // hero off-screen — don't run the animation loop
    const root = ref.current;
    if (!root) return;
    const section = root.parentElement ?? root;
    const blobs = Array.from(root.querySelectorAll<HTMLElement>("[data-blob]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = BLOBS.map((b) => ({ x: b.x, y: b.y }));

    if (reduce) return; // leave blobs at their static initial positions

    let targetX = 0.5;
    let targetY = 0.42;
    let pointerActive = false;
    let raf = 0;
    let t = 0;

    // Cache the container size so the per-frame loop never reads layout (which
    // would force a reflow). Refresh only on resize.
    let rect = section.getBoundingClientRect();
    const onResize = () => {
      rect = section.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
      pointerActive = true;
    };
    const onLeave = () => {
      pointerActive = false;
    };

    const frame = () => {
      t += 0.006;
      // Ambient figure-eight drift used while the pointer is idle.
      const ambientX = 0.5 + Math.cos(t) * 0.2;
      const ambientY = 0.42 + Math.sin(t * 0.9) * 0.16;
      const gx = pointerActive ? targetX : ambientX;
      const gy = pointerActive ? targetY : ambientY;

      state.forEach((s, i) => {
        s.x += (gx - s.x) * BLOBS[i].speed;
        s.y += (gy - s.y) * BLOBS[i].speed;
        const b = blobs[i];
        // Animate via transform (composited, no reflow) as a px delta from the
        // element's static left/top anchor. The -50% keeps it centred.
        const dx = (s.x - BLOBS[i].x) * rect.width;
        const dy = (s.y - BLOBS[i].y) * rect.height;
        b.style.transform = `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0)`;
      });
      raf = requestAnimationFrame(frame);
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

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
          className={`absolute rounded-full blur-3xl will-change-transform ${b.className}`}
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            transform: "translate(-50%, -50%)",
            background: FILL[b.hue],
          }}
        />
      ))}
    </div>
  );
}
