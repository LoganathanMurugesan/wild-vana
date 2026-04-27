import { useState, useEffect, useCallback, useRef } from 'react';
import slides from '../data/slides';
import { useParallax } from '../hooks/useParallax';

const INTERVAL = 6000; // ms between auto-advance
const TRANSITION_DURATION = 1400; // ms for ink animation

export default function BackgroundSlider({ onSlideChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inkOrigin, setInkOrigin] = useState({ x: 50, y: 50 });
  const timerRef = useRef(null);

  const goToSlide = useCallback(
    (idx, origin = { x: 50, y: 50 }) => {
      if (isTransitioning || idx === currentIndex) return;
      setInkOrigin(origin);
      setNextIndex(idx);
      setIsTransitioning(true);

      // Halfway through the ink animation, swap the background
      setTimeout(() => {
        setCurrentIndex(idx);
        onSlideChange?.(idx);
      }, TRANSITION_DURATION * 0.45);

      // End transition
      setTimeout(() => {
        setIsTransitioning(false);
        setNextIndex(null);
      }, TRANSITION_DURATION);
    },
    [currentIndex, isTransitioning, onSlideChange]
  );

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const next = (currentIndex + 1) % slides.length;
      // Random origin for organic feel
      const origins = [
        { x: 20, y: 30 },
        { x: 80, y: 20 },
        { x: 50, y: 80 },
        { x: 30, y: 60 },
        { x: 70, y: 50 },
      ];
      goToSlide(next, origins[Math.floor(Math.random() * origins.length)]);
    }, INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, goToSlide]);

  const slide = slides[currentIndex];
  const heroBg = useParallax(0.15);
  const heroText = useParallax(-0.1);

  return (
    <>
      {/* SVG filter for watercolor edge effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="watercolor">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Current background image */}
      <div
        ref={heroBg.ref}
        className="absolute -inset-10 bg-cover bg-center ken-burns"
        key={`bg-${currentIndex}`}
        style={{ backgroundImage: `url(${slide.url})`, ...heroBg.style }}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

      {/* Ink bleed transition overlay */}
      <div
        className={`ink-overlay ${isTransitioning ? 'ink-splash' : ''}`}
        style={{
          '--cx': `${inkOrigin.x}%`,
          '--cy': `${inkOrigin.y}%`,
        }}
      />

      {/* Navigation dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToSlide(i, { x: 90, y: 50 })}
            className={`group relative w-3 h-3 rounded-full border-2 transition-all duration-300 cursor-pointer ${
              i === currentIndex
                ? 'bg-gold border-gold dot-active scale-125'
                : 'bg-transparent border-white/60 hover:border-gold hover:scale-110'
            }`}
            aria-label={`Go to ${s.location}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-xs font-body rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {s.location}
            </span>
          </button>
        ))}
      </div>

      {/* Slide destination & tagline */}
      <div
        ref={heroText.ref}
        className="absolute bottom-32 left-10 z-20 text-left max-w-2xl"
        style={heroText.style}
      >
        <p
          className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-2"
          key={`dest-${currentIndex}`}
        >
          {slide.destination} — {slide.location}
        </p>
        <h2
          className="text-white font-display text-5xl md:text-6xl leading-tight mb-3"
          key={`tag-${currentIndex}`}
          style={{ animation: 'fadeSlideUp 0.8s ease-out 0.5s both' }}
        >
          {slide.tagline}
        </h2>
      </div>

      {/* Inline keyframes for text entrance */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
