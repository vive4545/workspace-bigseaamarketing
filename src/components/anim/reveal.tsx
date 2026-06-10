"use client";

import {
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-triggered reveal. Animates the element (or its direct children when
 * `stagger` is set) up + in as it enters the viewport. Initial state is applied
 * in a layout effect so there's no flash, and content remains visible if JS is
 * disabled — keeping it crawlable.
 */
export function Reveal({
  children,
  className,
  as,
  y = 28,
  delay = 0,
  duration = 0.9,
  stagger = false,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: boolean;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // Callback ref (not the ref object) so the dynamic createElement below doesn't
  // trip react-hooks/refs by appearing to read `.current` during render. useGSAP
  // still scopes off the ref object, whose `.current` is only read in the effect.
  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };
  // Cast to a single-prop ComponentType (not ElementType) so JSX below stays
  // type-safe without the dynamic-element union exploding (TS2590).
  const Tag = (as ?? "div") as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger ? (el.children as unknown as Element[]) : el;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={setRef} className={className}>
      {children}
    </Tag>
  );
}
