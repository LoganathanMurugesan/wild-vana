import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import staticSlides from '../data/slides';
import { supabase } from '../lib/supabase';
import FindOutMoreModal from './FindOutMoreModal';

const parseJson = (val, fallback = []) => {
  if (Array.isArray(val) && val.length > 0) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length > 0) return p; } catch { /* fall through */ } }
  return fallback;
};

const TABS = ['Overview', 'Itinerary', 'Gallery', "FAQ's", 'Cost & Terms'];

const defaultInclusions = [
  'Accommodation in standard room',
  'Excursions as noted',
  'Meals as noted',
  'Private transportation',
  'Park / reserve entrance fees',
  'Expert wildlife photo guide throughout the expedition',
];

const defaultExclusions = [
  'Soft drinks, bottled water, beer, wines, mixed drinks',
  'International and domestic flights',
  'Travel insurance',
  'Personal expenses, laundry, tips, and gratuities',
  'Visa fees (if applicable)',
];

const defaultFaqs = [
  {
    q: 'What level of fitness do I need?',
    a: 'A moderate level of fitness is recommended. Most photography happens from vehicles, but some hikes or short walks may be involved.',
  },
  {
    q: 'What camera gear should I bring?',
    a: 'A DSLR or mirrorless body with a telephoto lens (at least 400mm) is recommended. A wide-angle lens for landscapes is also helpful.',
  },
  {
    q: 'How many photographers per vehicle?',
    a: 'We keep the group small — typically two to three photographers per vehicle to ensure everyone has a clear shot.',
  },
  {
    q: 'Is this trip suitable for beginners?',
    a: 'Yes. Our guides offer hands-on instruction and the small group format means plenty of one-on-one time.',
  },
];

function buildItinerary(duration) {
  const match = (duration || '').match(/(\d+)/);
  const days = match ? Math.min(parseInt(match[1], 10), 14) : 5;
  const templates = [
    { title: 'Arrival & Welcome', body: 'Arrive at the destination, transfer to the lodge, and settle in. Evening briefing with your photo guide over dinner.' },
    { title: 'First Light Drive', body: 'Pre-dawn departure for our first photographic safari. Capture the golden hour light as wildlife stirs.' },
    { title: 'Full Day in the Wild', body: 'Two long game drives bookending a midday break for downloading images and reviewing technique with your guide.' },
    { title: 'Tracking the Big Cats', body: 'Dedicated session focused on locating and photographing the apex predators of the region.' },
    { title: 'Landscape & Wildlife', body: 'Combine sweeping landscapes with intimate wildlife portraits as we explore a new sector of the reserve.' },
    { title: 'Hidden Corners', body: 'Travel to less-visited areas for fresh compositions and the chance to photograph rarer species.' },
    { title: 'Predator & Prey', body: 'Long stake-outs at known waterholes and kill sites give us the patience-rewarded shots.' },
    { title: 'Bird Photography Focus', body: 'A change of pace with emphasis on the rich birdlife of the area — perfect for honing your tracking skills.' },
    { title: "Photographer's Choice", body: 'Return to your favourite locations from earlier in the trip to refine the images you most want to make.' },
    { title: 'Final Game Drive & Departure', body: 'A last morning session in the field, then transfer back for onward travel home.' },
  ];
  return Array.from({ length: days }, (_, i) => {
    const t = templates[i] ?? templates[templates.length - 2];
    return { day: i + 1, ...t };
  });
}

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('tours').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      if (data) {
        setTour({
          id: data.id, destination: data.destination, location: data.location,
          tagline: data.tagline, description: data.description, duration: data.duration,
          groupSize: data.group_size, bestTime: data.best_time, price: data.price,
          heroImage: data.hero_image, tileImage: data.tile_image,
          tripDates: data.trip_dates, seatsLeft: data.seats_left,
          itinerary: data.itinerary, inclusions: data.inclusions,
          exclusions: data.exclusions, faqs: data.faqs,
          galleryImages: data.gallery_images,
        });
      } else {
        const fallback = staticSlides.find(s => String(s.id) === String(id));
        if (fallback) {
          setTour({
            id: fallback.id, destination: fallback.destination, location: fallback.location,
            tagline: fallback.tagline, description: fallback.description, duration: fallback.duration,
            groupSize: fallback.groupSize, bestTime: fallback.bestTime, price: fallback.price,
            heroImage: fallback.url, tileImage: fallback.tileImage,
          });
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-white/40 font-body tracking-widest text-sm uppercase">Loading…</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-white font-display text-3xl">Tour not found</h1>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-gold text-ink font-body text-sm font-semibold rounded-sm cursor-pointer hover:bg-gold-dark transition-colors border-none">
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Nav bar */}
      <div className="sticky top-0 z-40 bg-ink/95 backdrop-blur-sm border-b border-white/10 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-gold font-body text-sm tracking-wider uppercase no-underline transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Wild Vana
        </Link>
        <button
          onClick={() => setEnquiryOpen(true)}
          className="px-5 py-2 bg-gold text-ink font-body text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors cursor-pointer border-none"
        >
          Book Now
        </button>
      </div>

      {/* Hero */}
      <div className="w-full h-[45vh] md:h-[60vh] relative overflow-hidden">
        <img src={tour.heroImage} alt={tour.location} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-2">{tour.destination} · Photo Safari</p>
          <h1 className="font-display text-4xl md:text-6xl text-white leading-tight">
            {tour.location}
          </h1>
        </div>
      </div>

      {/* Header info row */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid md:grid-cols-3 gap-10">
        {/* Description */}
        <div className="md:col-span-2">
          <p className="text-white/60 font-body leading-relaxed text-base">
            {tour.description || tour.tagline}
          </p>
        </div>

        {/* Price card */}
        <aside className="bg-white/5 border border-white/10 rounded-xl p-6 text-center self-start">
          <p className="text-gold font-display text-4xl font-bold mb-1">{tour.price}/-</p>
          <p className="text-white/50 font-body text-xs leading-snug mb-4">
            (5% GST and 20% TCS for Indian National)
          </p>
          {tour.tripDates && (
            <p className="text-white font-body text-sm mb-1">{tour.tripDates}</p>
          )}
          {!tour.tripDates && tour.bestTime && (
            <p className="text-white font-body text-sm mb-1">{tour.bestTime}</p>
          )}
          {tour.groupSize && (
            <p className="text-white/70 font-body text-sm mb-3">Group Size: {tour.groupSize}</p>
          )}
          {(tour.seatsLeft ?? 1) > 0 && (
            <p className="text-red-400 font-body text-sm font-semibold mb-5">
              ({String(tour.seatsLeft ?? 1).padStart(2, '0')} Seat{(tour.seatsLeft ?? 1) !== 1 ? 's' : ''} Left)
            </p>
          )}
          <button
            onClick={() => setEnquiryOpen(true)}
            className="w-full py-3 bg-gold text-ink font-body text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors cursor-pointer border-none"
          >
            Book Now
          </button>
        </aside>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 font-body text-xs tracking-wider uppercase rounded-sm transition-colors cursor-pointer border-none ${
                  active
                    ? 'bg-gold text-ink font-semibold'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="w-full h-px bg-white/10 mt-4" />
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 min-h-[40vh]">
        {tab === 'Overview' && (
          <div className="max-w-3xl space-y-5">
            <h2 className="font-display text-2xl text-white">About this expedition</h2>
            <p className="text-white/60 font-body leading-relaxed">
              {tour.description || tour.tagline}
            </p>
            <p className="text-white/60 font-body leading-relaxed">
              Join us in {tour.location}, {tour.destination}, for an immersive {tour.duration?.toLowerCase()} photography expedition.
              With small group sizes ({tour.groupSize}) and expert guides, you will have unmatched access and instruction in the field.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Duration', value: tour.duration },
                { label: 'Group Size', value: tour.groupSize },
                { label: 'Best Time', value: tour.bestTime },
                { label: 'Price', value: tour.price },
              ].filter(s => s.value).map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/40 font-body text-xs tracking-wider uppercase mb-1">{s.label}</p>
                  <p className="text-gold font-display text-lg">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Itinerary' && (() => {
          const days = parseJson(tour.itinerary, buildItinerary(tour.duration));
          return (
            <div className="max-w-3xl space-y-4">
              <h2 className="font-display text-2xl text-white mb-6">Day-by-day itinerary</h2>
              {days.map((d, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-gold font-body text-xs tracking-[0.25em] uppercase mb-1">
                    Day {String(d.day ?? i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display text-xl text-white mb-2">{d.title}</h3>
                  <p className="text-white/50 font-body text-sm leading-relaxed">{d.body}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {tab === 'Gallery' && (() => {
          const extra = parseJson(tour.galleryImages);
          const all = [...[tour.heroImage, tour.tileImage].filter(Boolean), ...extra];
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {all.map((src, i) => (
                <div key={i} className="aspect-video overflow-hidden rounded-xl bg-white/5">
                  <img src={src} alt={`${tour.location} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          );
        })()}

        {tab === "FAQ's" && (() => {
          const faqs = parseJson(tour.faqs, defaultFaqs);
          return (
            <div className="max-w-3xl space-y-3">
              <h2 className="font-display text-2xl text-white mb-6">Frequently asked questions</h2>
              {faqs.map((f, i) => (
                <details key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 group">
                  <summary className="font-body font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                    {f.q}
                    <span className="text-gold text-lg leading-none">+</span>
                  </summary>
                  <p className="text-white/50 font-body text-sm leading-relaxed mt-3 border-t border-white/10 pt-3">{f.a}</p>
                </details>
              ))}
            </div>
          );
        })()}

        {tab === 'Cost & Terms' && (() => {
          const inclusions = parseJson(tour.inclusions, defaultInclusions);
          const exclusions = parseJson(tour.exclusions, defaultExclusions);
          return (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl text-white mb-1">Price per person: {tour.price}/-</h2>
              <p className="text-white/40 font-body text-sm mb-8">(5% GST and 20% TCS for Indian National)</p>

              <h3 className="font-body font-semibold text-white/80 uppercase tracking-wider text-xs mb-4">Inclusions</h3>
              <ul className="space-y-3 mb-8">
                {inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 font-body text-sm">
                    <span className="text-gold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-body font-semibold text-white/80 uppercase tracking-wider text-xs mb-4">Exclusions</h3>
              <ul className="space-y-3 mb-8">
                {exclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 font-body text-sm">
                    <span className="text-gold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/40 font-body text-xs leading-relaxed">
                  Terms &amp; conditions apply. Final pricing and inclusions will be confirmed in your booking documents.
                  Prices shown are per person based on shared accommodation.
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer strip */}
      <div className="border-t border-white/10 mt-10 py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p className="text-white/30 font-body text-sm">© 2026 Wild Vana. All rights reserved.</p>
        <button
          onClick={() => setEnquiryOpen(true)}
          className="px-8 py-3 bg-gold text-ink font-body text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-dark transition-colors cursor-pointer border-none"
        >
          Book Now
        </button>
      </div>

      {enquiryOpen && (
        <FindOutMoreModal
          tourLocation={tour.location}
          tourDestination={tour.destination}
          onClose={() => setEnquiryOpen(false)}
        />
      )}
    </div>
  );
}
