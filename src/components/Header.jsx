import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-gold"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" />
            <path d="M8 14c1-2 3-3 4-3s3 1 4 3" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-display text-xl tracking-wider leading-none">
            Wild Vana
          </h1>
          <p className="text-gold/70 font-body text-[10px] tracking-[0.35em] uppercase">
            Wildlife Photography Tours
          </p>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {['Destinations', 'About', 'Gallery', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item === 'Destinations' ? 'tours' : item.toLowerCase()}`}
            className="text-white/80 hover:text-gold font-body text-sm tracking-wider uppercase transition-colors duration-300 no-underline"
          >
            {item}
          </a>
        ))}
        <a
          href="#contact"
          className="ml-4 px-6 py-2.5 bg-gold text-ink font-body text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors duration-300 no-underline"
        >
          Book a Tour
        </a>
      </nav>

      {/* Mobile burger */}
      <button
        className="md:hidden text-white w-8 h-8 flex flex-col justify-center items-center gap-1.5 bg-transparent border-none cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
        />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center py-8 gap-6">
            {['Destinations', 'About', 'Gallery', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item === 'Destinations' ? 'tours' : item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="text-white/80 hover:text-gold font-body text-lg tracking-wider uppercase no-underline"
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="px-8 py-3 bg-gold text-ink font-body font-semibold tracking-wider uppercase rounded-sm no-underline"
            >
              Book a Tour
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
