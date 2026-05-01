import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BUCKET = 'gallery';

const spanOptions = [
  { label: 'Normal (1×1)', value: '' },
  { label: 'Wide (2 cols)', value: 'col-span-2' },
  { label: 'Tall (2 rows)', value: 'row-span-2' },
  { label: 'Large (2×2)', value: 'col-span-2 row-span-2' },
];

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [spanInput, setSpanInput] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = () =>
    supabase.from('gallery_images').select('*').order('sort_order').then(({ data }) => setImages(data ?? []));

  useEffect(() => { load(); }, []);

  const addByUrl = async (e) => {
    e.preventDefault();
    if (!urlInput) return;
    await supabase.from('gallery_images').insert([{
      src: urlInput, alt: altInput, span: spanInput,
      sort_order: images.length + 1,
    }]);
    setUrlInput(''); setAltInput(''); setSpanInput('');
    load();
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await supabase.from('gallery_images').insert([{
        src: publicUrl, alt: file.name.replace(/\.[^/.]+$/, ''), span: '',
        sort_order: images.length + 1,
      }]);
      load();
    }
    setUploading(false);
    e.target.value = '';
  };

  const remove = async (img) => {
    if (!window.confirm('Remove this image from the gallery?')) return;
    setDeleting(img.id);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    setDeleting(null);
    load();
  };

  const updateSpan = async (id, span) => {
    await supabase.from('gallery_images').update({ span }).eq('id', id);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-white font-display text-3xl mb-2">Gallery</h1>
      <p className="text-white/40 font-body text-sm mb-8">{images.length} images</p>

      {/* Add image panel */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-white font-body text-sm tracking-wider uppercase mb-4">Add Image</h2>

        {/* File upload */}
        <div className="mb-5">
          <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Upload from device</label>
          <label className={`flex items-center gap-3 px-4 py-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-gold/40 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-white/50 font-body text-sm">{uploading ? 'Uploading…' : 'Click to choose a file'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={uploadFile} disabled={uploading} />
          </label>
        </div>

        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 font-body text-xs">or add by URL</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* URL input */}
        <form onSubmit={addByUrl} className="space-y-3">
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white font-body text-sm outline-none focus:border-gold transition-colors"
            placeholder="https://images.unsplash.com/…" />
          <div className="grid grid-cols-2 gap-3">
            <input value={altInput} onChange={e => setAltInput(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white font-body text-sm outline-none focus:border-gold transition-colors"
              placeholder="Alt text / description" />
            <select value={spanInput} onChange={e => setSpanInput(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white/70 font-body text-sm outline-none focus:border-gold transition-colors appearance-none cursor-pointer">
              {spanOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={!urlInput}
            className="px-5 py-2.5 bg-gold text-ink font-body text-sm font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-40">
            Add Image
          </button>
        </form>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="aspect-square">
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white/70 font-body text-xs truncate mb-2">{img.alt || '—'}</p>
              <select value={img.span} onChange={e => updateSpan(img.id, e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-md px-2 py-1.5 text-white/50 font-body text-xs outline-none focus:border-gold transition-colors appearance-none cursor-pointer mb-2">
                {spanOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => remove(img)} disabled={deleting === img.id}
                className="w-full py-1.5 border border-white/15 rounded-md text-white/40 hover:text-red-400 hover:border-red-400/30 font-body text-xs transition-colors cursor-pointer bg-transparent disabled:opacity-40">
                {deleting === img.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
