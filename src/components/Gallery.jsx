import { useState } from 'react';
import { useScrollReveal } from '../hooks/useParallax';

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1561731216-c3a4d514e396?w=600&h=400&q=80&fit=crop', alt: 'Bengal Tiger in Ranthambore', span: 'col-span-2 row-span-2' },
  { src: 'https://images.unsplash.com/photo-1535338454528-1b4a56484cd2?w=400&h=400&q=80&fit=crop', alt: 'Indian Rhinoceros in Kaziranga', span: '' },
  { src: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=400&q=80&fit=crop', alt: 'Birds at Bharatpur', span: '' },
  { src: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=600&q=80&fit=crop', alt: 'Wildebeest migration in Masai Mara', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=400&h=400&q=80&fit=crop', alt: 'Tiger at Jim Corbett', span: '' },
  { src: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&h=400&q=80&fit=crop', alt: 'Asiatic Lion in Gir Forest', span: 'col-span-2' },
  { src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&q=80&fit=crop', alt: 'Savanna sunset in Kenya', span: '' },
  { src: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=400&q=80&fit=crop', alt: 'Elephant herd', span: '' },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const headerReveal = useScrollReveal(0.1);
  const gridReveal = useScrollReveal(0.05);

  return (
    <section id="gallery" className="relative bg-forest-dark py-24 px-6 md:px-12">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6">Captured Moments</p>

      <div className="max-w-6xl mx-auto">
        <div ref={headerReveal.ref} style={headerReveal.style} className="mb-14">
          <h2 className="text-white font-display text-4xl md:text-5xl leading-tight">Gallery</h2>
          <p className="text-white/50 font-body mt-4 text-lg max-w-xl">
            A glimpse into the extraordinary encounters our guests have witnessed.
          </p>
        </div>

        <div ref={gridReveal.ref} style={gridReveal.style} className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-lg cursor-pointer group ${img.span}`}
              onClick={() => setLightbox(img)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                <p className="text-white font-body text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-gold hover:text-gold transition-colors bg-transparent cursor-pointer" onClick={() => setLightbox(null)} aria-label="Close lightbox">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightbox.src.replace('w=400', 'w=1200').replace('w=600', 'w=1200')} alt={lightbox.alt} className="max-w-full max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 font-body text-sm">{lightbox.alt}</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
