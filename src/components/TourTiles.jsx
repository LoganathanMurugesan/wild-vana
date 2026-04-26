import { useRef, useState, useEffect } from 'react';
import slides from '../data/slides';

export default function TourTiles() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative bg-forest py-20 px-6 md:px-12">
      {/* Section header */}
      <div className="mb-12 max-w-3xl">
        <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-3">
          Explore Destinations
        </p>
        <h2 className="text-white font-display text-4xl md:text-5xl leading-tight">
          Your Tours
        </h2>
      </div>

      {/* Arrow navigation */}
      <div className="absolute top-24 right-6 md:right-12 flex gap-3 z-10">
        <button
          onClick={() => scroll('left')}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer bg-transparent ${
            canScrollLeft
              ? 'border-gold text-gold hover:bg-gold hover:text-ink'
              : 'border-white/15 text-white/20 cursor-default'
          }`}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer bg-transparent ${
            canScrollRight
              ? 'border-gold text-gold hover:bg-gold hover:text-ink'
              : 'border-white/15 text-white/20 cursor-default'
          }`}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tiles horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="tiles-scroll flex gap-0 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4A437 rgba(255,255,255,0.05)' }}
      >
        {slides.map((tour, i) => {
          const isHovered = hoveredId === tour.id;
          return (
            <div
              key={tour.id}
              className="snap-start flex-shrink-0 relative group"
              style={{ width: '280px', height: '620px' }}
              onMouseEnter={() => setHoveredId(tour.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Vertical image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={tour.tileImage}
                  alt={`${tour.location} wildlife photography tour`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                  loading="lazy"
                />
                {/* Gradient overlay — darker at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {/* Left edge separator line */}
                {i > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                )}
              </div>

              {/* Destination label — top */}
              <div className="absolute top-5 left-5 z-10">
                <span className="text-gold/80 font-body text-[10px] tracking-[0.3em] uppercase">
                  {tour.destination}
                </span>
              </div>

              {/* Content — bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h3 className="text-white font-display text-2xl leading-tight mb-1">
                  {tour.location}
                </h3>
                <p
                  className="text-white/60 font-body text-xs mb-3 leading-relaxed overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: isHovered ? '3rem' : '0',
                    opacity: isHovered ? 1 : 0,
                  }}
                >
                  {tour.tagline}
                </p>

                {/* Price + Duration row */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-gold font-display text-xl font-semibold">
                    {tour.price}
                  </span>
                  <span className="text-white/40 font-body text-xs">
                    / {tour.duration}
                  </span>
                </div>

                {/* Action buttons */}
                <div
                  className="flex flex-col gap-2 transition-all duration-500"
                  style={{
                    maxHeight: isHovered ? '6rem' : '0',
                    opacity: isHovered ? 1 : 0,
                    overflow: 'hidden',
                  }}
                >
                  <button className="w-full py-2.5 bg-gold text-ink font-body text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors cursor-pointer">
                    Book Now
                  </button>
                  <button className="w-full py-2.5 border border-white/25 text-white/80 font-body text-xs tracking-wider uppercase rounded-sm hover:border-gold hover:text-gold transition-colors cursor-pointer bg-transparent">
                    View Itinerary
                  </button>
                </div>
              </div>

              {/* Index number watermark */}
              <div className="absolute top-4 right-5 z-10">
                <span
                  className="font-display text-white/10 text-5xl font-bold leading-none"
                  style={{ fontSize: '3.5rem' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          );
        })}

        {/* End spacer so last tile can scroll into view */}
        <div className="flex-shrink-0 w-12" />
      </div>

      {/* Subtle gradient fades on edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-40 bottom-0 w-16 bg-gradient-to-r from-forest to-transparent pointer-events-none z-[5]" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-40 bottom-0 w-16 bg-gradient-to-l from-forest to-transparent pointer-events-none z-[5]" />
      )}
    </section>
  );
}
