import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Lightweight parallax hook — returns a ref to attach to any element
 * and a style object with the parallax transform applied.
 *
 * @param {number} speed - Parallax factor. 0 = no movement, 0.5 = half scroll speed, -0.3 = inverse.
 * @param {string} direction - 'vertical' (default) or 'horizontal'
 */
export function useParallax(speed = 0.3, direction = 'vertical') {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const windowH = window.innerHeight;
          // How far the element center is from viewport center, normalized
          const elementCenter = rect.top + rect.height / 2;
          const delta = (elementCenter - windowH / 2) * speed;
          setOffset(delta);
        }
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const style =
    direction === 'horizontal'
      ? { transform: `translateX(${offset}px)`, willChange: 'transform' }
      : { transform: `translateY(${offset}px)`, willChange: 'transform' };

  return { ref, style };
}

/**
 * Hook that triggers fade-in + slide-up when element enters viewport.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
  };

  return { ref, style, isVisible };
}
