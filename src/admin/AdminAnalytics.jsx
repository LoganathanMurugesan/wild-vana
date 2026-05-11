import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ── Helpers ───────────────────────────────────────────────────
const parseDevice = (ua = '') => {
  if (!ua) return 'Unknown';
  if (/mobile|android|iphone/i.test(ua)) return 'Mobile';
  if (/ipad|tablet/i.test(ua))           return 'Tablet';
  return 'Desktop';
};

const parseBrowser = (ua = '') => {
  if (!ua) return 'Unknown';
  if (/edg\//i.test(ua))    return 'Edge';
  if (/opr\//i.test(ua))    return 'Opera';
  if (/chrome/i.test(ua))   return 'Chrome';
  if (/firefox/i.test(ua))  return 'Firefox';
  if (/safari/i.test(ua))   return 'Safari';
  return 'Other';
};

const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const fmtTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const k = keyFn(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

const topN = (obj, n = 5) =>
  Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

const eventLabels = {
  page_view:             'Page View',
  tour_view:             'Tour View',
  booking_click:         'Booking Click',
  competition_register:  'Competition Register',
  section_view:          'Section View',
};

const eventColors = {
  page_view:             'bg-sky-400',
  tour_view:             'bg-gold',
  booking_click:         'bg-emerald-400',
  competition_register:  'bg-purple-400',
  section_view:          'bg-white/30',
};

const RANGES = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 30 days', days: 30 },
  { label: 'All time',     days: 0  },
];

// ── Mini SVG Bar Chart ────────────────────────────────────────
function BarChart({ data, height = 120 }) {
  if (!data.length) return null;
  const max   = Math.max(...data.map(d => d.value), 1);
  const W     = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${data.length * 24} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * (height - 24), 2);
          const x    = i * 24 + 3;
          const y    = height - barH - 16;
          return (
            <g key={i}>
              <rect x={x} y={y} width={18} height={barH}
                fill={d.value > 0 ? '#D4A437' : 'rgba(255,255,255,0.08)'}
                rx="2" opacity="0.9" />
              {data.length <= 14 && (
                <text x={x + 9} y={height - 2} textAnchor="middle"
                  fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="sans-serif">
                  {shortDate(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Horizontal stat bar ───────────────────────────────────────
function StatBar({ label, value, max, color = 'bg-gold' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-white/70 font-body text-sm truncate max-w-[70%]">{label || '(direct)'}</p>
        <p className="text-white font-body text-sm font-medium">{value.toLocaleString('en-IN')}</p>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AdminAnalytics() {
  const [rangeIdx,  setRangeIdx]  = useState(1);
  const [events,    setEvents]    = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadData(); }, [rangeIdx]);

  async function loadData() {
    setLoading(true);

    const range = RANGES[rangeIdx];
    let query   = supabase.from('analytics_events').select('*').order('created_at', { ascending: true });

    if (range.days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - range.days);
      query = query.gte('created_at', since.toISOString());
    }

    const [{ data: evts }, { data: rec }] = await Promise.all([
      query,
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    setEvents(evts  || []);
    setRecent(rec   || []);
    setLoading(false);
  }

  // ── Derived stats ─────────────────────────────────────────
  const sessions    = new Set(events.map(e => e.session_id)).size;
  const pageViews   = events.filter(e => e.event_type === 'page_view').length;
  const tourViews   = events.filter(e => e.event_type === 'tour_view').length;
  const bookClicks  = events.filter(e => e.event_type === 'booking_click').length;
  const compRegs    = events.filter(e => e.event_type === 'competition_register').length;

  // Daily chart
  const range = RANGES[rangeIdx];
  const days  = range.days || 30;
  const dailyMap = groupBy(events, e => e.created_at.substring(0, 10));
  const dailyData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d     = new Date();
    d.setDate(d.getDate() - (Math.min(days, 30) - 1 - i));
    const key   = d.toISOString().substring(0, 10);
    return { date: key, value: dailyMap[key] || 0 };
  });

  // Top tours
  const tourEvts  = events.filter(e => e.event_type === 'tour_view' && e.tour_location);
  const topTours  = topN(groupBy(tourEvts, e => e.tour_location));
  const maxTours  = topTours[0]?.[1] || 1;

  // Referrers
  const refEvts   = events.filter(e => e.referrer);
  const cleanRef  = (r) => { try { return new URL(r).hostname; } catch { return r; } };
  const topRefs   = topN(groupBy(refEvts, e => cleanRef(e.referrer)));
  const maxRefs   = topRefs[0]?.[1] || 1;

  // Devices
  const deviceMap  = groupBy(events, e => parseDevice(e.user_agent));
  const browserMap = groupBy(events, e => parseBrowser(e.user_agent));

  // Event type breakdown
  const typeMap  = groupBy(events, e => e.event_type);
  const topTypes = topN(typeMap, 10);
  const maxType  = topTypes[0]?.[1] || 1;

  // Top pages
  const pageMap  = groupBy(events.filter(e => e.page), e => e.page);
  const topPages = topN(pageMap);
  const maxPages = topPages[0]?.[1] || 1;

  const summaryCards = [
    { label: 'Unique Sessions',    value: sessions,   color: 'text-gold',        icon: '👤' },
    { label: 'Page Views',         value: pageViews,  color: 'text-sky-400',     icon: '📄' },
    { label: 'Tour Views',         value: tourViews,  color: 'text-emerald-400', icon: '🗺️'  },
    { label: 'Booking Clicks',     value: bookClicks, color: 'text-amber-400',   icon: '🎫' },
    { label: 'Competition Sign-ups', value: compRegs, color: 'text-purple-400',  icon: '🏆' },
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white">Analytics</h1>
          <p className="text-white/40 font-body text-sm mt-1">Visitor insights and engagement metrics</p>
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {RANGES.map((r, i) => (
            <button key={r.label} onClick={() => setRangeIdx(i)}
              className={`px-3 py-1.5 rounded-md font-body text-xs transition-colors cursor-pointer border-none ${
                rangeIdx === i ? 'bg-gold text-ink font-semibold' : 'text-white/50 hover:text-white bg-transparent'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white/30 font-body">Loading analytics…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-white/40 font-body text-base mb-1">No data yet</p>
          <p className="text-white/25 font-body text-sm">Events will appear here once visitors access the site.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {summaryCards.map(c => (
              <div key={c.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-2xl mb-2">{c.icon}</p>
                <p className={`font-display text-3xl font-semibold ${c.color}`}>
                  {c.value.toLocaleString('en-IN')}
                </p>
                <p className="text-white/40 font-body text-xs mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Daily activity + Top Tours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Daily chart */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-1">Daily Activity</p>
              <p className="text-white font-display text-xl mb-6">
                {dailyData.reduce((s, d) => s + d.value, 0).toLocaleString('en-IN')} events
              </p>
              <BarChart data={dailyData} height={130} />
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 rounded-sm bg-gold/80" />
                <p className="text-white/30 font-body text-xs">Events per day</p>
              </div>
            </div>

            {/* Top tours */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-1">Most Viewed Tours</p>
              <p className="text-white font-display text-xl mb-6">{tourViews.toLocaleString('en-IN')} total tour views</p>
              {topTours.length === 0 ? (
                <p className="text-white/25 font-body text-sm">No tour views yet.</p>
              ) : (
                <div className="space-y-4">
                  {topTours.map(([name, count]) => (
                    <StatBar key={name} label={name} value={count} max={maxTours} color="bg-gold" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Traffic sources + Devices + Browsers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Referrers */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-4">Traffic Sources</p>
              {topRefs.length === 0 ? (
                <p className="text-white/25 font-body text-sm">All direct traffic so far.</p>
              ) : (
                <div className="space-y-4">
                  {topRefs.map(([ref, count]) => (
                    <StatBar key={ref} label={ref} value={count} max={maxRefs} color="bg-sky-400" />
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-4">Devices</p>
              <div className="space-y-4">
                {Object.entries(deviceMap).sort((a, b) => b[1] - a[1]).map(([device, count]) => (
                  <StatBar key={device} label={device} value={count}
                    max={Math.max(...Object.values(deviceMap))}
                    color={device === 'Mobile' ? 'bg-emerald-400' : device === 'Tablet' ? 'bg-amber-400' : 'bg-sky-400'} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/30 font-body text-xs uppercase tracking-wider mb-3">Browsers</p>
                <div className="space-y-3">
                  {Object.entries(browserMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([browser, count]) => (
                    <StatBar key={browser} label={browser} value={count}
                      max={Math.max(...Object.values(browserMap))} color="bg-purple-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Event types */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-4">Event Breakdown</p>
              <div className="space-y-4">
                {topTypes.map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${eventColors[type] || 'bg-white/30'}`} />
                        <p className="text-white/70 font-body text-sm">{eventLabels[type] || type}</p>
                      </div>
                      <p className="text-white font-body text-sm font-medium">{count.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${eventColors[type] || 'bg-white/30'} transition-all duration-500`}
                        style={{ width: `${Math.round((count / maxType) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-4">Top Pages</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {topPages.map(([page, count]) => (
                <StatBar key={page} label={page} value={count} max={maxPages} color="bg-gold/70" />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <p className="text-white/50 font-body text-xs uppercase tracking-wider mb-0.5">Recent Activity</p>
              <p className="text-white font-display text-xl">Last 50 events</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Event', 'Page', 'Tour', 'Device', 'Browser', 'Time'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(e => (
                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${eventColors[e.event_type] || 'bg-white/10'} bg-opacity-20 text-white`}>
                          {eventLabels[e.event_type] || e.event_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/50 max-w-[160px] truncate">{e.page || '—'}</td>
                      <td className="px-5 py-3 text-gold/80">{e.tour_location || '—'}</td>
                      <td className="px-5 py-3 text-white/50">{parseDevice(e.user_agent)}</td>
                      <td className="px-5 py-3 text-white/50">{parseBrowser(e.user_agent)}</td>
                      <td className="px-5 py-3 text-white/30 whitespace-nowrap">{fmtTime(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
