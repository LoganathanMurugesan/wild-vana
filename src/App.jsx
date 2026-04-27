import { useState, useCallback } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Header from './components/Header';
import TourTiles from './components/TourTiles';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSlideChange = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  return (
    <div className="bg-black">
      {/* Hero — full viewport */}
      <section className="relative w-full h-screen overflow-hidden mb-48">
        <BackgroundSlider onSlideChange={handleSlideChange} />

        <Header />

        {/* Scroll down indicator — bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <a
            href="#tours"
            className="group flex flex-col items-center gap-2 text-white/60 hover:text-gold transition-colors duration-300"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase">
              Scroll to Explore
            </span>
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      <div id="tours" className="mb-48"><TourTiles /></div>
      <About />
      <Gallery />
      <Contact />
    </div>
  );
}
