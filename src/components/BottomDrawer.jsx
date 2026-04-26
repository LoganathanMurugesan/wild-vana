import { useEffect, useRef } from 'react';
import slides from '../data/slides';

export default function BottomDrawer({ isOpen, onClose, slideIndex }) {
  const drawerRef = useRef(null);
  const slide = slides[slideIndex] || slides[0];

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur-lg rounded-t-3xl ${
          isOpen ? 'drawer-open' : 'drawer-close'
        }`}
        style={{
          maxHeight: '70vh',
          transform: isOpen ? undefined : 'translateY(100%)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        <div className="px-8 md:px-16 py-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 2rem)' }}>
          {/* Header row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-1">
                {slide.destination}
              </p>
              <h3 className="text-white font-display text-3xl md:text-4xl">
                {slide.location}
              </h3>
              <p className="text-white/50 font-body text-sm mt-1 italic">
                {slide.tagline}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-white/50 transition-colors cursor-pointer bg-transparent"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tour info cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Duration', value: slide.duration, icon: '◷' },
              { label: 'Group Size', value: slide.groupSize, icon: '◈' },
              { label: 'Best Time', value: slide.bestTime, icon: '✦' },
            ].map((info) => (
              <div
                key={info.label}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
              >
                <span className="text-gold text-lg">{info.icon}</span>
                <p className="text-white font-body font-semibold text-lg mt-1">
                  {info.value}
                </p>
                <p className="text-white/40 font-body text-xs uppercase tracking-wider">
                  {info.label}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-white/70 font-body leading-relaxed mb-8 max-w-2xl">
            {slide.description}
          </p>

          {/* CTA */}
          <div className="flex gap-4 mb-6">
            <button className="px-8 py-3 bg-gold text-ink font-body font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors cursor-pointer">
              Enquire Now
            </button>
            <button className="px-8 py-3 border border-white/30 text-white font-body tracking-wider uppercase rounded-sm hover:border-gold hover:text-gold transition-colors cursor-pointer bg-transparent">
              View Itinerary
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
