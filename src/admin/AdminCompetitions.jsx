import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const statusOptions = ['upcoming', 'active', 'judging', 'closed'];
const statusColors  = {
  upcoming: 'text-blue-400 bg-blue-400/10',
  active:   'text-emerald-400 bg-emerald-400/10',
  judging:  'text-amber-400 bg-amber-400/10',
  closed:   'text-white/30 bg-white/5',
};
const rankMeta = {
  1: { label: '🥇 Gold',   color: 'text-yellow-400' },
  2: { label: '🥈 Silver', color: 'text-gray-300' },
  3: { label: '🥉 Bronze', color: 'text-amber-600' },
};
const emptyComp = { title: '', description: '', theme: '', start_date: '', end_date: '', status: 'upcoming', cover_image: '' };

const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white font-body text-sm outline-none focus:border-gold transition-colors';
const labelCls = 'text-white/40 font-body text-xs uppercase tracking-wider block mb-1.5';

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [entries,      setEntries]      = useState({});
  const [winners,      setWinners]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);

  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(emptyComp);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const [winnerModal,    setWinnerModal]    = useState(null);
  const [winnerEntry,    setWinnerEntry]    = useState(null);
  const [declaringSaving, setDeclaringSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: comps } = await supabase
      .from('competitions').select('*').order('created_at', { ascending: false });

    const compList = comps || [];
    setCompetitions(compList);

    if (compList.length) {
      const eMap = {}, wMap = {};
      await Promise.all(compList.map(async c => {
        const [{ data: e }, { data: w }] = await Promise.all([
          supabase.from('competition_entries')
            .select('*, competition_registrations(first_name, last_name, email)')
            .eq('competition_id', c.id).order('submitted_at', { ascending: false }),
          supabase.from('competition_winners')
            .select('*, competition_registrations(first_name, last_name)')
            .eq('competition_id', c.id).order('rank'),
        ]);
        eMap[c.id] = e || [];
        wMap[c.id] = w || [];
      }));
      setEntries(eMap);
      setWinners(wMap);

      setSelected(prev => prev ? (compList.find(c => c.id === prev.id) || null) : null);
    }
    setLoading(false);
  }

  function openNew() {
    setForm(emptyComp);
    setEditing(null);
    setError('');
    setModal(true);
  }

  function openEdit(comp) {
    setForm({
      title:       comp.title,
      description: comp.description || '',
      theme:       comp.theme || '',
      start_date:  comp.start_date,
      end_date:    comp.end_date,
      status:      comp.status,
      cover_image: comp.cover_image || '',
    });
    setEditing(comp);
    setError('');
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...form };
    const { error: err } = editing
      ? await supabase.from('competitions').update(payload).eq('id', editing.id)
      : await supabase.from('competitions').insert([payload]);
    if (err) { setError(err.message); setSaving(false); return; }
    setModal(false);
    await loadAll();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this competition and all its entries? This cannot be undone.')) return;
    await supabase.from('competitions').delete().eq('id', id);
    if (selected?.id === id) setSelected(null);
    await loadAll();
  }

  async function handleStatusChange(comp, status) {
    await supabase.from('competitions').update({ status }).eq('id', comp.id);
    await loadAll();
  }

  async function handleDeclareWinner() {
    if (!winnerEntry || !winnerModal) return;
    setDeclaringSaving(true);
    const rankNames = { 1: 'GOLD', 2: 'SILVER', 3: 'BRONZE' };
    const code      = `WILDVANA-${rankNames[winnerModal.rank]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const validDate = new Date();
    validDate.setMonth(validDate.getMonth() + 6);

    const { error: err } = await supabase.from('competition_winners').upsert([{
      competition_id:      winnerModal.competitionId,
      registration_id:     winnerEntry.registration_id,
      rank:                winnerModal.rank,
      discount_code:       code,
      discount_valid_until: validDate.toISOString().split('T')[0],
    }], { onConflict: 'competition_id,rank' });

    if (err) { alert(err.message); setDeclaringSaving(false); return; }
    setWinnerModal(null);
    setWinnerEntry(null);
    setDeclaringSaving(false);
    await loadAll();
  }

  const f = key => ({
    value:    form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const selectedEntries = selected ? (entries[selected.id] || []) : [];
  const selectedWinners = selected ? (winners[selected.id] || []) : [];

  return (
    <div className="p-6 md:p-8 min-h-screen">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Competitions</h1>
          <p className="text-white/40 font-body text-sm mt-1">Create competitions and declare winners</p>
        </div>
        <button onClick={openNew}
          className="px-5 py-2.5 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold/90 transition-colors cursor-pointer border-none">
          + New Competition
        </button>
      </div>

      {loading ? (
        <p className="text-white/40 font-body">Loading…</p>
      ) : competitions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white/40 font-body">No competitions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Competition list */}
          <div className="space-y-3">
            {competitions.map(comp => (
              <div
                key={comp.id}
                onClick={() => setSelected(comp)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === comp.id
                    ? 'border-gold/50 bg-gold/5'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-display text-base text-white leading-tight">{comp.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-body uppercase tracking-wider flex-shrink-0 ${statusColors[comp.status]}`}>
                    {comp.status}
                  </span>
                </div>
                {comp.theme && <p className="text-gold/60 font-body text-xs mb-1">Theme: {comp.theme}</p>}
                <p className="text-white/25 font-body text-xs">
                  {(entries[comp.id] || []).length} entries · {(winners[comp.id] || []).length} winners
                </p>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-16 flex items-center justify-center h-full">
                <p className="text-white/25 font-body text-center">Select a competition to manage it</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

                {/* Competition header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-display text-2xl text-white">{selected.title}</h2>
                      {selected.theme && <p className="text-gold/70 font-body text-sm mt-0.5">Theme: {selected.theme}</p>}
                      <p className="text-white/30 font-body text-xs mt-1">
                        {new Date(selected.start_date).toLocaleDateString('en-IN')} – {new Date(selected.end_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={selected.status}
                        onChange={e => { handleStatusChange(selected, e.target.value); setSelected(s => ({ ...s, status: e.target.value })); }}
                        className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-white font-body text-xs outline-none cursor-pointer"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => openEdit(selected)}
                        className="px-3 py-1.5 bg-white/10 text-white font-body text-xs rounded-lg hover:bg-white/20 transition-colors cursor-pointer border-none">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(selected.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 font-body text-xs rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer border-none">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">

                  {/* Entries */}
                  <div>
                    <p className="text-white/40 font-body text-xs uppercase tracking-wider mb-4">
                      Entries ({selectedEntries.length})
                    </p>
                    {selectedEntries.length === 0 ? (
                      <p className="text-white/25 font-body text-sm">No entries yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedEntries.map(entry => {
                          const existingWin = selectedWinners.find(w => w.registration_id === entry.registration_id);
                          return (
                            <div key={entry.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
                              <img src={entry.photo_url} alt={entry.title || 'Entry'} className="w-full h-32 object-cover" />
                              <div className="p-2.5">
                                <p className="text-white font-body text-xs font-medium truncate">
                                  {entry.competition_registrations?.first_name} {entry.competition_registrations?.last_name}
                                </p>
                                {entry.title && <p className="text-gold/60 font-body text-[10px] truncate">{entry.title}</p>}
                                <p className="text-white/25 font-body text-[10px] truncate">{entry.competition_registrations?.email}</p>
                              </div>
                              <div className="px-2.5 pb-2.5">
                                {existingWin ? (
                                  <div>
                                    <p className={`font-body text-[10px] ${rankMeta[existingWin.rank].color}`}>
                                      {rankMeta[existingWin.rank].label}
                                    </p>
                                    <p className="text-emerald-400/60 font-mono text-[9px] mt-0.5 break-all">{existingWin.discount_code}</p>
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                    {[1, 2, 3].map(rank => (
                                      <button key={rank}
                                        onClick={() => { setWinnerModal({ competitionId: selected.id, rank }); setWinnerEntry(entry); }}
                                        className="flex-1 py-1 bg-white/8 hover:bg-gold/20 hover:text-gold text-white/40 font-body text-[9px] rounded transition-colors cursor-pointer border-none">
                                        {rankMeta[rank].label.split(' ')[0]}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Declared winners */}
                  {selectedWinners.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-white/40 font-body text-xs uppercase tracking-wider mb-4">Declared Winners</p>
                      <div className="space-y-2">
                        {selectedWinners.map(w => (
                          <div key={w.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3 gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xl flex-shrink-0">{rankMeta[w.rank].label.split(' ')[0]}</span>
                              <div className="min-w-0">
                                <p className="text-white font-body text-sm truncate">
                                  {w.competition_registrations?.first_name} {w.competition_registrations?.last_name}
                                </p>
                                <p className="text-emerald-400 font-mono text-xs truncate">{w.discount_code}</p>
                              </div>
                            </div>
                            <p className="text-white/25 font-body text-xs flex-shrink-0">
                              {w.discount_valid_until
                                ? `Till ${new Date(w.discount_valid_until).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                                : '—'
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/15 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-xl text-white">{editing ? 'Edit Competition' : 'New Competition'}</h3>
              <button onClick={() => setModal(false)}
                className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input required className={inputCls} placeholder="Competition title" {...f('title')} />
              </div>
              <div>
                <label className={labelCls}>Theme</label>
                <input className={inputCls} placeholder="e.g. Best Wildlife Portrait" {...f('theme')} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Describe the competition…" {...f('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date *</label>
                  <input required type="date" className={inputCls} {...f('start_date')} />
                </div>
                <div>
                  <label className={labelCls}>End Date *</label>
                  <input required type="date" className={inputCls} {...f('end_date')} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={`${inputCls} cursor-pointer`} {...f('status')}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cover Image URL</label>
                <input className={inputCls} placeholder="https://…" {...f('cover_image')} />
              </div>
              {error && <p className="text-red-400 font-body text-xs">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 bg-white/10 text-white font-body text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer border-none">
                  Cancel
                </button>
                <button disabled={saving}
                  className="flex-1 py-2.5 bg-gold text-ink font-body font-semibold text-sm rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 cursor-pointer border-none">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Declare Winner Confirm Modal */}
      {winnerModal && winnerEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/15 rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-display text-xl text-white mb-2">Declare Winner</h3>
            <p className="text-white/50 font-body text-sm mb-3">
              Award{' '}
              <span className={rankMeta[winnerModal.rank].color}>{rankMeta[winnerModal.rank].label}</span>
              {' '}to{' '}
              <span className="text-white">
                {winnerEntry.competition_registrations?.first_name} {winnerEntry.competition_registrations?.last_name}
              </span>?
            </p>
            <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3 mb-5">
              <p className="text-gold/80 font-body text-xs leading-relaxed">
                A unique discount code will be generated automatically and will be valid for <strong>6 months</strong>. The winner earns <strong>15% off</strong> their next booking.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setWinnerModal(null); setWinnerEntry(null); }}
                className="flex-1 py-2.5 bg-white/10 text-white font-body text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer border-none">
                Cancel
              </button>
              <button onClick={handleDeclareWinner} disabled={declaringSaving}
                className="flex-1 py-2.5 bg-gold text-ink font-body font-semibold text-sm rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 cursor-pointer border-none">
                {declaringSaving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
