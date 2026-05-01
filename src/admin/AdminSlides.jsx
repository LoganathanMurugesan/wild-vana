import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function AdminSlides() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    supabase.from('tours').select('id, destination, location, tagline, hero_image, tile_image, published, sort_order')
      .order('sort_order')
      .then(({ data }) => setTours(data ?? []));
  }, []);

  const toggle = async (t) => {
    await supabase.from('tours').update({ published: !t.published }).eq('id', t.id);
    setTours(prev => prev.map(x => x.id === t.id ? { ...x, published: !x.published } : x));
  };

  const moveUp = async (idx) => {
    if (idx === 0) return;
    const a = tours[idx], b = tours[idx - 1];
    await Promise.all([
      supabase.from('tours').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('tours').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    const next = [...tours];
    next[idx] = { ...a, sort_order: b.sort_order };
    next[idx - 1] = { ...b, sort_order: a.sort_order };
    setTours(next.sort((x, y) => x.sort_order - y.sort_order));
  };

  const moveDown = async (idx) => {
    if (idx === tours.length - 1) return;
    const a = tours[idx], b = tours[idx + 1];
    await Promise.all([
      supabase.from('tours').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('tours').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    const next = [...tours];
    next[idx] = { ...a, sort_order: b.sort_order };
    next[idx + 1] = { ...b, sort_order: a.sort_order };
    setTours(next.sort((x, y) => x.sort_order - y.sort_order));
  };

  return (
    <div className="p-8">
      <h1 className="text-white font-display text-3xl mb-2">Hero Slides</h1>
      <p className="text-white/40 font-body text-sm mb-2">
        Hero slides are driven by published tours. Toggle a tour's visibility or reorder them here.
        To edit hero images, go to <Link to="/admin/tours" className="text-gold underline">Tours</Link>.
      </p>
      <p className="text-white/30 font-body text-xs mb-8">Drag order = hero carousel order = tour tiles order.</p>

      <div className="space-y-3">
        {tours.map((t, idx) => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            {/* Order controls */}
            <div className="flex flex-col gap-1">
              <button onClick={() => moveUp(idx)} disabled={idx === 0}
                className="w-7 h-7 rounded border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer bg-transparent disabled:opacity-20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === tours.length - 1}
                className="w-7 h-7 rounded border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer bg-transparent disabled:opacity-20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
            </div>

            <span className="text-white/20 font-display text-2xl w-8 text-center flex-shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>

            {t.hero_image && (
              <img src={t.hero_image} alt={t.location}
                className="w-20 h-12 object-cover rounded-lg flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white font-body font-medium">{t.location} <span className="text-white/30 text-xs">· {t.destination}</span></p>
              <p className="text-white/40 font-body text-sm truncate">{t.tagline}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-body ${t.published ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                {t.published ? 'Visible' : 'Hidden'}
              </span>
              <button onClick={() => toggle(t)}
                className="px-3 py-1.5 text-xs font-body border border-white/15 rounded-lg text-white/50 hover:text-white hover:border-white/30 transition-colors cursor-pointer bg-transparent">
                {t.published ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
