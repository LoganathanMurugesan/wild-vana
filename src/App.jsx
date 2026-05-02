import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import BackgroundSlider from './components/BackgroundSlider';
import Header from './components/Header';
import TourTiles from './components/TourTiles';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import TourDetails from './components/TourDetails';

import AdminRoute from './admin/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminTours from './admin/AdminTours';
import AdminGallery from './admin/AdminGallery';
import AdminSlides from './admin/AdminSlides';
import AdminBookings from './admin/AdminBookings';

function PublicSite() {
  const [, setCurrentSlide] = useState(0);
  const handleSlideChange = useCallback((index) => setCurrentSlide(index), []);

  return (
    <div className="bg-black">
      <section className="relative w-full h-screen overflow-hidden">
        <BackgroundSlider onSlideChange={handleSlideChange} />
        <Header />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <a href="#tours" className="group flex flex-col items-center gap-2 text-white/60 hover:text-gold transition-colors duration-300">
            <span className="font-body text-[10px] tracking-[0.3em] uppercase">Scroll to Explore</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>
      <div id="tours"><TourTiles /></div>
      <About />
      <Gallery />
      <Contact />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicSite />} />
      <Route path="/tours/:id" element={<TourDetails />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin (protected) */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="slides" element={<AdminSlides />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>
    </Routes>
  );
}
