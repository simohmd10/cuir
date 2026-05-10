import { useEffect, useRef } from 'react';

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

function isInViewport(el: HTMLElement, buffer = 120) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= vh + buffer && rect.bottom >= -buffer;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: RevealOptions
) {
  const ref = useRef<T>(null);
  const { threshold = 0.08, rootMargin = '120px 0px', once = true, delay } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.classList.add('revealed');
      return;
    }

    if (delay) el.style.transitionDelay = `${delay}ms`;

    const reveal = () => el.classList.add('revealed');

    // Prevent mobile "hidden until tap/scroll" by checking once after layout settles.
    const rafId = requestAnimationFrame(() => {
      if (isInViewport(el, 160)) reveal();
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            reveal();
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove('revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, delay]);

  return ref;
}

export function useRevealGroup<T extends HTMLElement = HTMLDivElement>(
  options?: Omit<RevealOptions, 'delay'>
) {
  const ref = useRef<T>(null);
  const { threshold = 0.04, rootMargin = '160px 0px', once = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.classList.add('revealed');
      return;
    }

    const reveal = () => el.classList.add('revealed');

    const rafId = requestAnimationFrame(() => {
      if (isInViewport(el, 220)) reveal();
    });

    // Failsafe: if IO callback never arrives on some mobile browsers, don't keep cards invisible.
    const failSafe = window.setTimeout(reveal, 700);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            reveal();
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove('revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return ref;
}
