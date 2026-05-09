import { useEffect, useRef } from 'react';

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number; // ms — adds delay via inline style
}

/**
 * Attach to any element. Adds 'revealed' class when it enters the viewport.
 * Pairs with the .reveal / .reveal-fade CSS classes in index.css.
 * Zero JS animation overhead — all transitions are pure CSS.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: RevealOptions
) {
  const ref = useRef<T>(null);
  const { threshold = 0.12, rootMargin = '-32px', once = true, delay } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honour prefers-reduced-motion immediately
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.classList.add('revealed');
      return;
    }

    if (delay) {
      (el as HTMLElement).style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed');
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove('revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, delay]);

  return ref;
}

/**
 * Staggered reveal for a container's direct children.
 * Adds 'revealed' to the container; children use CSS :nth-child delays.
 */
export function useRevealGroup<T extends HTMLElement = HTMLDivElement>(
  options?: Omit<RevealOptions, 'delay'>
) {
  const ref = useRef<T>(null);
  const { threshold = 0.08, rootMargin = '-20px', once = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed');
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove('revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
