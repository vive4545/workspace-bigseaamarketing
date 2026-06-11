/**
 * Full-page floating background orbs. A fixed, behind-everything layer of soft
 * gradient blobs that drift on slow CSS loops. No JavaScript, no main-thread
 * cost — only `transform` is animated (see `.orb` in globals.css). Sits at
 * -z-10 so it paints above the page background but beneath all content, and is
 * pointer-events-none so it never intercepts clicks. Honours reduced-motion via
 * the global media query in globals.css.
 */

type Orb = {
  hue: "primary" | "accent" | "mix";
  /** position within the viewport */
  left: string;
  top: string;
  /** responsive size (capped) */
  size: string;
  anim: "orb-float-a" | "orb-float-b" | "orb-float-c";
  duration: string;
  /** negative delay spreads the orbs across their loops immediately */
  delay: string;
  opacity: number;
};

const ORBS: Orb[] = [
  { hue: "primary", left: "4%", top: "6%", size: "min(42vw, 640px)", anim: "orb-float-a", duration: "24s", delay: "0s", opacity: 0.55 },
  { hue: "accent", left: "68%", top: "10%", size: "min(34vw, 520px)", anim: "orb-float-b", duration: "29s", delay: "-7s", opacity: 0.5 },
  { hue: "mix", left: "38%", top: "48%", size: "min(32vw, 500px)", anim: "orb-float-c", duration: "34s", delay: "-4s", opacity: 0.45 },
  { hue: "primary", left: "78%", top: "66%", size: "min(30vw, 460px)", anim: "orb-float-b", duration: "27s", delay: "-12s", opacity: 0.4 },
  { hue: "accent", left: "10%", top: "74%", size: "min(28vw, 440px)", anim: "orb-float-a", duration: "31s", delay: "-9s", opacity: 0.42 },
];

const FILL: Record<Orb["hue"], string> = {
  primary:
    "radial-gradient(circle, color-mix(in oklch, var(--primary) 50%, transparent), transparent 66%)",
  accent:
    "radial-gradient(circle, color-mix(in oklch, var(--accent) 50%, transparent), transparent 66%)",
  mix: "radial-gradient(circle, color-mix(in oklch, var(--primary) 45%, var(--accent)), transparent 64%)",
};

export function PageOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={`orb ${o.anim}`}
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            opacity: o.opacity,
            background: FILL[o.hue],
            animationDuration: o.duration,
            animationDelay: o.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
