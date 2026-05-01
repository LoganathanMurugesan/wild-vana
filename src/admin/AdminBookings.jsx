import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_COLORS = {
  pending: 'bg-amber-400/15 text-amber-400',
  confirmed: 'bg-emerald-400/15 text-emerald-400',
  cancelled: 'bg-red-400/15 text-red-400',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = () =>
    supabase.from('bookings').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setBookings(data ?? []));

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    load();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-8">
      <h1 className="text-white font-display text-3xl mb-2">Bookings</h1>
      <p className="text-white/40 font-body text-sm mb-6">{bookings.filter(b => b.status === 'pending').length} pending enquiries</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-body text-sm capitalize transition-colors cursor-pointer border ${
              filter === s ? 'bg-gold/15 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}>
            {s} {s === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-white/30 font-body text-sm py-10 text-center">No enquiries found.</p>
        )}
        {filtered.map(b => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Row */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpanded(expanded === b.id ? null : b.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-body font-medium">{b.first_name} {b.last_name}</p>
                  <span className="text-white/30 text-xs">·</span>
                  <p className="text-white/50 font-body text-sm">{b.email}</p>
                  {b.destination && <>
                    <span className="text-white/30 text-xs">·</span>
                    <p className="text-gold/70 font-body text-sm">{b.destination}</p>
                  </>}
                </div>
                <p className="text-white/30 font-body text-xs mt-0.5">
                  {new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-body flex-shrink-0 ${STATUS_COLORS[b.status]}`}>
                {b.status}
              </span>
              <svg className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${expanded === b.id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Expanded */}
            {expanded === b.id && (
              <div className="border-t border-white/10 p-4 bg-white/3">
                {b.message && (
                  <div className="mb-4">
                    <p className="text-white/40 font-body text-xs uppercase tracking-wider mb-1">Message</p>
                    <p className="text-white/70 font-body text-sm leading-relaxed">{b.message}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <p className="text-white/40 font-body text-xs uppercase tracking-wider self-center mr-2">Mark as:</p>
                  {['pending', 'confirmed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setStatus(b.id, s)} disabled={b.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body capitalize border transition-colors cursor-pointer ${
                        b.status === s ? 'opacity-40 cursor-default' : 'hover:border-white/30'
                      } ${STATUS_COLORS[s].replace('bg-', 'border-').replace('/15', '/30')} bg-transparent`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
