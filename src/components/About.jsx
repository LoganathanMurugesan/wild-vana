import { useParallax, useScrollReveal } from '../hooks/useParallax';

export default function About() {
  const imageParallax = useParallax(0.12);
  const textReveal = useScrollReveal(0.1);
  const statsReveal = useScrollReveal(0.2);

  return (
    <section id="about" className="relative bg-ink py-32 px-6 md:px-12 overflow-hidden mb-48">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left — text content */}
        <div ref={textReveal.ref} style={textReveal.style}>
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-3">
            Our Story
          </p>
          <h2 className="text-white font-display text-4xl md:text-5xl leading-tight mb-6">
            About Wild Vana
          </h2>
          <p className="text-white/60 font-body leading-relaxed mb-5">
            Born from a deep passion for wildlife and the art of photography, Wild Vana curates
            immersive expeditions into the world's most untamed landscapes. From the tiger-rich
            forests of Central India to the sweeping savannas of the Masai Mara, every tour is
            designed around the perfect frame.
          </p>
          <p className="text-white/60 font-body leading-relaxed mb-5">
            Our team of naturalists, photographers, and local guides brings decades of field
            experience. We keep groups small, timing our safaris with golden hour light and
            seasonal wildlife patterns to give you the best possible shots.
          </p>
          <p className="text-white/60 font-body leading-relaxed mb-8">
            Whether you're a seasoned pro or picking up a camera for the first time on safari,
            Wild Vana is your gateway to witnessing nature's most extraordinary moments.
          </p>

          {/* Stats */}
          <div ref={statsReveal.ref} style={statsReveal.style} className="grid grid-cols-3 gap-6">
            {[
              { value: '12+', label: 'Years Experience' },
              { value: '200+', label: 'Tours Completed' },
              { value: '98%', label: 'Happy Travelers' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-gold font-display text-3xl font-semibold">{stat.value}</p>
                <p className="text-white/40 font-body text-xs uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image + accent */}
        <div className="relative" ref={imageParallax.ref} style={imageParallax.style}>
          <div className="relative rounded-lg overflow-hidden aspect-[3/4]">
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=1000&q=80&fit=crop"
              alt="Wildlife photographer in the field"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-gold/20 rounded-lg -z-10" />
          <div className="absolute -bottom-8 left-6 right-6 bg-forest/90 backdrop-blur-sm p-5 rounded-lg border border-white/10">
            <p className="text-white/80 font-body text-sm italic leading-relaxed">
              "In every walk with nature, one receives far more than he seeks."
            </p>
            <p className="text-gold/70 font-body text-xs mt-2 tracking-wider">— John Muir</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
