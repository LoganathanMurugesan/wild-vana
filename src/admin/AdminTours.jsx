import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const empty = { destination: '', location: '', tagline: '', description: '', duration: '', group_size: '', best_time: '', price: '', hero_image: '', tile_image: '', sort_order: 0, published: true };

const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white font-body text-sm outline-none focus:border-gold transition-colors';
const labelCls = 'text-white/40 font-body text-xs uppercase tracking-wider block mb-1.5';

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | tour object
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () =>
    supabase.from('tours').select('*').order('sort_order').then(({ data }) => setTours(data ?? []));

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (t) => { setForm(t); setEditing(t); };
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
              <p className="text-gold font-body text-sm mt-0.5">{t.price} · {t.duration}</p>
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

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-display text-xl">{editing === 'new' ? 'Add Tour' : 'Edit Tour'}</h2>
              <button onClick={close} className="text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-xl">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
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
                  <input className={inputCls} placeholder="$4,200" {...f('price')} />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Best Time</label>
                  <input className={inputCls} placeholder="Oct – Apr" {...f('best_time')} />
                </div>
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
              <div className="flex gap-3 pt-2">
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
