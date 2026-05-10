import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const empty = {
  destination: '', location: '', tagline: '', description: '',
  duration: '', group_size: '', best_time: '', price: '',
  trip_dates: '', seats_left: 1,
  hero_image: '', tile_image: '',
  itinerary: [], inclusions: [], exclusions: [], faqs: [], gallery_images: [],
  sort_order: 0, published: true,
};

const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white font-body text-sm outline-none focus:border-gold transition-colors';
const labelCls = 'text-white/40 font-body text-xs uppercase tracking-wider block mb-1.5';
const sectionCls = 'border border-white/10 rounded-xl p-5 space-y-4';
const sectionTitleCls = 'text-white font-body text-sm font-semibold uppercase tracking-wider mb-3';
const addBtnCls = 'mt-2 px-3 py-1.5 text-xs font-body border border-gold/40 rounded-lg text-gold hover:bg-gold/10 transition-colors cursor-pointer bg-transparent';
const removeBtnCls = 'ml-2 px-2 py-1 text-xs font-body text-white/30 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded transition-colors cursor-pointer bg-transparent flex-shrink-0';

// ── Generic single-text list editor (inclusions / exclusions / gallery_images) ──
function ListEditor({ label, items, onChange, placeholder }) {
  const add = () => onChange([...items, '']);
  const update = (i, val) => { const n = [...items]; n[i] = val; onChange(n); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className={sectionCls}>
      <p className={sectionTitleCls}>{label}</p>
      {items.length === 0 && (
        <p className="text-white/20 font-body text-xs italic">No items yet. Click + Add to begin.</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button type="button" onClick={() => remove(i)} className={removeBtnCls}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className={addBtnCls}>+ Add item</button>
    </div>
  );
}

// ── Itinerary day editor ──
function ItineraryEditor({ items, onChange }) {
  const add = () => onChange([...items, { title: '', body: '' }]);
  const update = (i, key, val) => {
    const n = [...items];
    n[i] = { ...n[i], [key]: val };
    onChange(n);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const n = [...items];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className={sectionCls}>
      <p className={sectionTitleCls}>Itinerary</p>
      {items.length === 0 && (
        <p className="text-white/20 font-body text-xs italic">No days yet. Click + Add Day to begin.</p>
      )}
      <div className="space-y-3">
        {items.map((day, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gold font-body text-xs tracking-wider uppercase">Day {i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="px-2 py-1 text-xs text-white/30 hover:text-white disabled:opacity-20 border border-white/10 rounded bg-transparent cursor-pointer transition-colors">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                  className="px-2 py-1 text-xs text-white/30 hover:text-white disabled:opacity-20 border border-white/10 rounded bg-transparent cursor-pointer transition-colors">↓</button>
                <button type="button" onClick={() => remove(i)}
                  className="px-2 py-1 text-xs text-white/30 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded bg-transparent cursor-pointer transition-colors">✕</button>
              </div>
            </div>
            <input
              className={inputCls}
              value={day.title}
              onChange={e => update(i, 'title', e.target.value)}
              placeholder="Day title (e.g. Arrival & Welcome)"
            />
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={day.body}
              onChange={e => update(i, 'body', e.target.value)}
              placeholder="Describe what happens on this day…"
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className={addBtnCls}>+ Add Day</button>
    </div>
  );
}

// ── FAQ editor ──
function FaqEditor({ items, onChange }) {
  const add = () => onChange([...items, { q: '', a: '' }]);
  const update = (i, key, val) => {
    const n = [...items];
    n[i] = { ...n[i], [key]: val };
    onChange(n);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className={sectionCls}>
      <p className={sectionTitleCls}>FAQ's</p>
      {items.length === 0 && (
        <p className="text-white/20 font-body text-xs italic">No FAQs yet. Click + Add FAQ to begin.</p>
      )}
      <div className="space-y-3">
        {items.map((faq, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 font-body text-xs uppercase tracking-wider">FAQ {i + 1}</span>
              <button type="button" onClick={() => remove(i)} className={removeBtnCls}>✕</button>
            </div>
            <input
              className={inputCls}
              value={faq.q}
              onChange={e => update(i, 'q', e.target.value)}
              placeholder="Question"
            />
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={faq.a}
              onChange={e => update(i, 'a', e.target.value)}
              placeholder="Answer"
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className={addBtnCls}>+ Add FAQ</button>
    </div>
  );
}

// ── Helpers to safely parse jsonb that may arrive as string or array ──
const parseJson = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
  return fallback;
};

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');

  const load = () =>
    supabase.from('tours').select('*').order('sort_order').then(({ data }) => setTours(data ?? []));

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); setActiveSection('basic'); };
  const openEdit = (t) => {
    setForm({
      ...t,
      itinerary: parseJson(t.itinerary),
      inclusions: parseJson(t.inclusions),
      exclusions: parseJson(t.exclusions),
      faqs: parseJson(t.faqs),
      gallery_images: parseJson(t.gallery_images),
    });
    setEditing(t);
    setActiveSection('basic');
  };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing === 'new') {
      await supabase.from('tours').insert([form]);
    } else {
      await supabase.from('tours').update(form).eq('id', editing.id);
    }
    setSaving(false);
    close();
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this tour?')) return;
    setDeleting(id);
    await supabase.from('tours').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  const toggle = async (t) => {
    await supabase.from('tours').update({ published: !t.published }).eq('id', t.id);
    load();
  };

  const f = (key) => ({ value: form[key] ?? '', onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });
  const setList = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const SECTIONS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'costs', label: 'Cost & Terms' },
    { id: 'faqs', label: "FAQ's" },
    { id: 'gallery', label: 'Gallery' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-3xl">Tours</h1>
          <p className="text-white/40 font-body text-sm mt-1">{tours.length} tours</p>
        </div>
        <button onClick={openNew} className="px-5 py-2.5 bg-gold text-ink font-body text-sm font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">
          + Add Tour
        </button>
      </div>

      {/* Tour list */}
      <div className="space-y-3">
        {tours.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            {t.tile_image && (
              <img src={t.tile_image} alt={t.location} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-body font-medium truncate">{t.location}</p>
                <span className="text-white/30 font-body text-xs">·</span>
                <p className="text-white/40 font-body text-xs">{t.destination}</p>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-body ${t.published ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  {t.published ? 'Live' : 'Draft'}
                </span>
              </div>
              <p className="text-white/40 font-body text-sm truncate mt-0.5">{t.tagline}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-gold font-body text-sm">{t.price} · {t.duration}</p>
                {parseJson(t.itinerary).length > 0 && (
                  <span className="text-emerald-400/70 font-body text-xs">✓ {parseJson(t.itinerary).length} itinerary days</span>
                )}
                {parseJson(t.inclusions).length > 0 && (
                  <span className="text-emerald-400/70 font-body text-xs">✓ inclusions</span>
                )}
                {parseJson(t.faqs).length > 0 && (
                  <span className="text-emerald-400/70 font-body text-xs">✓ {parseJson(t.faqs).length} FAQs</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggle(t)} className="px-3 py-1.5 text-xs font-body border border-white/15 rounded-lg text-white/50 hover:text-white hover:border-white/30 transition-colors cursor-pointer bg-transparent">
                {t.published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => openEdit(t)} className="px-3 py-1.5 text-xs font-body border border-white/15 rounded-lg text-white/50 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent">
                Edit
              </button>
              <button onClick={() => remove(t.id)} disabled={deleting === t.id} className="px-3 py-1.5 text-xs font-body border border-white/15 rounded-lg text-white/50 hover:text-red-400 hover:border-red-400/30 transition-colors cursor-pointer bg-transparent disabled:opacity-40">
                {deleting === t.id ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <h2 className="text-white font-display text-xl">{editing === 'new' ? 'Add Tour' : `Edit — ${form.location || 'Tour'}`}</h2>
              <button onClick={close} className="text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-xl">✕</button>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-white/10 px-6 flex-shrink-0 overflow-x-auto">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-3 font-body text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors cursor-pointer bg-transparent ${
                    activeSection === s.id
                      ? 'border-gold text-gold'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Scrollable form body */}
            <form onSubmit={save} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* ── BASIC INFO ── */}
              {activeSection === 'basic' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Destination *</label>
                      <input required className={inputCls} placeholder="India" {...f('destination')} />
                    </div>
                    <div>
                      <label className={labelCls}>Location *</label>
                      <input required className={inputCls} placeholder="Ranthambore" {...f('location')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Tagline *</label>
                    <input required className={inputCls} placeholder="Where Tigers Rule the Wild" {...f('tagline')} />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Tour description…" {...f('description')} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Price</label>
                      <input className={inputCls} placeholder="₹1,45,000" {...f('price')} />
                    </div>
                    <div>
                      <label className={labelCls}>Duration</label>
                      <input className={inputCls} placeholder="7 Days" {...f('duration')} />
                    </div>
                    <div>
                      <label className={labelCls}>Group Size</label>
                      <input className={inputCls} placeholder="6 Max" {...f('group_size')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Best Time</label>
                      <input className={inputCls} placeholder="Oct – Apr" {...f('best_time')} />
                    </div>
                    <div>
                      <label className={labelCls}>Trip Dates</label>
                      <input className={inputCls} placeholder="July 12th – July 18th, 2026" {...f('trip_dates')} />
                    </div>
                    <div>
                      <label className={labelCls}>Seats Left</label>
                      <input type="number" min="0" className={inputCls} {...f('seats_left')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input type="number" className={inputCls} {...f('sort_order')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Hero Image URL</label>
                    <input className={inputCls} placeholder="https://…" {...f('hero_image')} />
                  </div>
                  <div>
                    <label className={labelCls}>Tile Image URL</label>
                    <input className={inputCls} placeholder="https://…" {...f('tile_image')} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="accent-gold w-4 h-4 cursor-pointer" />
                    <label htmlFor="published" className="text-white/70 font-body text-sm cursor-pointer">Published (visible on website)</label>
                  </div>
                </>
              )}

              {/* ── ITINERARY ── */}
              {activeSection === 'itinerary' && (
                <ItineraryEditor items={form.itinerary} onChange={setList('itinerary')} />
              )}

              {/* ── COST & TERMS ── */}
              {activeSection === 'costs' && (
                <>
                  <ListEditor
                    label="Inclusions"
                    items={form.inclusions}
                    onChange={setList('inclusions')}
                    placeholder="e.g. Accommodation in standard room"
                  />
                  <ListEditor
                    label="Exclusions"
                    items={form.exclusions}
                    onChange={setList('exclusions')}
                    placeholder="e.g. International flights"
                  />
                </>
              )}

              {/* ── FAQ'S ── */}
              {activeSection === 'faqs' && (
                <FaqEditor items={form.faqs} onChange={setList('faqs')} />
              )}

              {/* ── GALLERY ── */}
              {activeSection === 'gallery' && (
                <>
                  <p className="text-white/40 font-body text-xs">Hero and Tile images are set in Basic Info. Add extra gallery photos here.</p>
                  <ListEditor
                    label="Additional Gallery Images"
                    items={form.gallery_images}
                    onChange={setList('gallery_images')}
                    placeholder="https://… (image URL)"
                  />
                </>
              )}

              {/* Save / Cancel — always visible */}
              <div className="flex gap-3 pt-2 border-t border-white/10 mt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-gold text-ink font-body font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : editing === 'new' ? 'Create Tour' : 'Save Changes'}
                </button>
                <button type="button" onClick={close} className="px-6 py-3 border border-white/15 text-white/60 font-body text-sm rounded-lg hover:border-white/30 transition-colors cursor-pointer bg-transparent">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
