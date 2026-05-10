import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'wv_competition_reg';
const BUCKET = 'competition-photos';

const statusColors = {
  upcoming: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  active:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  judging:  'text-amber-400 bg-amber-400/10 border-amber-400/30',
  closed:   'text-white/40 bg-white/5 border-white/20',
};

const rankEmoji  = { 1: '🥇', 2: '🥈', 3: '🥉' };
const rankLabel  = { 1: 'Gold',  2: 'Silver', 3: 'Bronze' };
const rankColors = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-amber-600' };

const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors';
const labelCls = 'text-white/40 font-body text-xs uppercase tracking-wider block mb-2';

export default function Competitions() {
  const [registration, setRegistration] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  });

  const [competitions, setCompetitions] = useState([]);
  const [entries,      setEntries]      = useState({});
  const [winners,      setWinners]      = useState([]);
  const [tours,        setTours]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [regForm,    setRegForm]    = useState({ first_name: '', last_name: '', email: '', phone: '', tour_attended: '' });
  const [regError,   setRegError]   = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [signingIn,      setSigningIn]      = useState(false);
  const [signInEmail,    setSignInEmail]    = useState('');
  const [signInError,    setSignInError]    = useState('');
  const [signInLoading,  setSignInLoading]  = useState(false);

  const [uploadModal,   setUploadModal]   = useState(null);
  const [uploadForm,    setUploadForm]    = useState({ title: '', caption: '' });
  const [uploadFile,    setUploadFile]    = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError,   setUploadError]   = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
    supabase.from('tours').select('id, location, destination').eq('published', true).order('sort_order')
      .then(({ data }) => { if (data) setTours(data); });
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: comps }, { data: wins }] = await Promise.all([
      supabase.from('competitions').select('*').order('created_at', { ascending: false }),
      supabase.from('competition_winners')
        .select('*, competition_registrations(first_name, last_name), competitions(title, theme)')
        .order('announced_at', { ascending: false }),
    ]);

    const compList = comps || [];
    setCompetitions(compList);
    setWinners(wins || []);

    if (compList.length) {
      const map = {};
      await Promise.all(compList.map(async c => {
        const { data } = await supabase
          .from('competition_entries')
          .select('*, competition_registrations(first_name, last_name)')
          .eq('competition_id', c.id)
          .order('submitted_at', { ascending: false });
        map[c.id] = data || [];
      }));
      setEntries(map);
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      const { data, error } = await supabase
        .from('competition_registrations')
        .upsert([{ ...regForm, email: regForm.email.trim().toLowerCase() }], { onConflict: 'email' })
        .select()
        .single();
      if (error) throw error;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setRegistration(data);
    } catch (err) {
      setRegError(err.message || 'Registration failed. Please try again.');
    }
    setRegLoading(false);
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    const { data } = await supabase
      .from('competition_registrations')
      .select('*')
      .eq('email', signInEmail.trim().toLowerCase())
      .maybeSingle();
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setRegistration(data);
      setSigningIn(false);
    } else {
      setSignInError('No registration found for this email. Please register first.');
    }
    setSignInLoading(false);
  }

  function handleSignOut() {
    localStorage.removeItem(STORAGE_KEY);
    setRegistration(null);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadFile) { setUploadError('Please select a photo.'); return; }
    setUploadError('');
    setUploadLoading(true);
    try {
      const ext  = uploadFile.name.split('.').pop();
      const path = `${uploadModal.competitionId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, uploadFile);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: entryErr } = await supabase.from('competition_entries').insert([{
        competition_id:  uploadModal.competitionId,
        registration_id: registration.id,
        photo_url:       publicUrl,
        title:           uploadForm.title,
        caption:         uploadForm.caption,
      }]);
      if (entryErr) throw entryErr;
      closeUploadModal();
      await loadData();
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
    setUploadLoading(false);
  }

  function closeUploadModal() {
    setUploadModal(null);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadForm({ title: '', caption: '' });
    setUploadError('');
  }

  const myEntry = (competitionId) =>
    registration && (entries[competitionId] || []).find(e => e.registration_id === registration.id);

  const winnerEntryPhoto = (w) =>
    (entries[w.competition_id] || []).find(e => e.registration_id === w.registration_id)?.photo_url;

  return (
    <div className="min-h-screen bg-ink text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gold" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" />
                <path d="M8 14c1-2 3-3 4-3s3 1 4 3" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-white font-display text-lg tracking-wider leading-none">Wild Vana</p>
              <p className="text-gold/60 font-body text-[9px] tracking-[0.3em] uppercase">Wildlife Photography Tours</p>
            </div>
          </Link>
          <div className="flex items-center gap-5">
            {registration && (
              <span className="hidden md:block text-white/50 font-body text-sm">
                Welcome, <span className="text-gold">{registration.first_name}</span>
              </span>
            )}
            <Link to="/" className="text-white/60 hover:text-gold font-body text-sm tracking-wider uppercase transition-colors no-underline">
              ← Back to Tours
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-4">Wild Vana Exclusive</p>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
            Photography<br />Competition
          </h1>
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Capture the wild. Share your vision. The finest wildlife photographs from our tours win <span className="text-gold font-semibold">15% off</span> their next expedition.
          </p>
          <a href="#register" className="inline-block px-8 py-3 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-gold/90 transition-colors no-underline">
            Join the Competition
          </a>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase text-center mb-10">How It Works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📋', title: 'Register',         desc: 'Sign up once with your name and email. Tell us which Wild Vana tour you attended.' },
              { step: '02', icon: '📷', title: 'Submit Your Shot', desc: 'Upload your best wildlife photograph from any Wild Vana tour to enter an active competition.' },
              { step: '03', icon: '🏆', title: 'Win Rewards',      desc: 'Winners receive a unique 15% discount code for their next Wild Vana tour, valid for 6 months.' },
            ].map(s => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <p className="text-gold/30 font-display text-5xl mb-3 leading-none">{s.step}</p>
                <p className="text-4xl mb-3">{s.icon}</p>
                <h3 className="font-display text-xl text-white mb-2">{s.title}</h3>
                <p className="text-white/50 font-body text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register / Welcome ── */}
      <section id="register" className="py-16 px-6 border-t border-white/10">
        <div className="max-w-xl mx-auto">

          {registration ? (
            <div className="bg-white/5 border border-gold/30 rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <h2 className="font-display text-2xl text-white mb-1">Welcome back, {registration.first_name}!</h2>
              <p className="text-white/50 font-body text-sm mb-5">
                Registered as <span className="text-gold">{registration.email}</span>
              </p>
              <p className="text-white/30 font-body text-xs mb-1">
                Scroll down to browse active competitions and submit your photo.
              </p>
              <button onClick={handleSignOut} className="text-white/25 hover:text-white/50 font-body text-xs underline bg-transparent border-none cursor-pointer transition-colors mt-3">
                Not you? Sign out
              </button>
            </div>

          ) : signingIn ? (
            <>
              <p className="text-gold font-body text-xs tracking-[0.3em] uppercase text-center mb-3">Already Registered</p>
              <h2 className="font-display text-3xl text-white text-center mb-8">Sign In</h2>
              <form onSubmit={handleSignIn} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" required value={signInEmail} onChange={e => setSignInEmail(e.target.value)}
                    placeholder="Your registered email" className={inputCls} />
                </div>
                {signInError && <p className="text-red-400 font-body text-xs">{signInError}</p>}
                <button disabled={signInLoading}
                  className="w-full py-3 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 cursor-pointer border-none">
                  {signInLoading ? 'Looking up…' : 'Sign In'}
                </button>
                <button type="button" onClick={() => setSigningIn(false)}
                  className="w-full text-white/40 hover:text-white/60 font-body text-xs text-center bg-transparent border-none cursor-pointer transition-colors">
                  ← Back to registration
                </button>
              </form>
            </>

          ) : (
            <>
              <p className="text-gold font-body text-xs tracking-[0.3em] uppercase text-center mb-3">Get Started</p>
              <h2 className="font-display text-3xl text-white text-center mb-8">Register to Participate</h2>
              <form onSubmit={handleRegister} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input required value={regForm.first_name} onChange={e => setRegForm(f => ({ ...f, first_name: e.target.value }))}
                      placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input required value={regForm.last_name} onChange={e => setRegForm(f => ({ ...f, last_name: e.target.value }))}
                      placeholder="Last name" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input required type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Your email address" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone <span className="normal-case text-white/20">(optional)</span></label>
                  <input value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Mobile number" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tour Attended</label>
                  <select value={regForm.tour_attended} onChange={e => setRegForm(f => ({ ...f, tour_attended: e.target.value }))}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="">Select a tour</option>
                    {tours.map(t => (
                      <option key={t.id} value={`${t.location}, ${t.destination}`}>{t.location}, {t.destination}</option>
                    ))}
                  </select>
                </div>
                {regError && <p className="text-red-400 font-body text-xs">{regError}</p>}
                <button disabled={regLoading}
                  className="w-full py-3 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 cursor-pointer border-none">
                  {regLoading ? 'Registering…' : 'Register Now'}
                </button>
                <p className="text-center">
                  <button type="button" onClick={() => setSigningIn(true)}
                    className="text-white/40 hover:text-gold font-body text-xs bg-transparent border-none cursor-pointer transition-colors">
                    Already registered? Sign in →
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── Active Competitions ── */}
      <section id="competitions" className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Compete</p>
          <h2 className="font-display text-4xl text-white mb-10">Active Competitions</h2>

          {loading ? (
            <p className="text-white/40 font-body">Loading competitions…</p>
          ) : competitions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
              <p className="text-4xl mb-4">🌿</p>
              <p className="text-white/40 font-body">No competitions yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitions.map(comp => {
                const compEntries = entries[comp.id] || [];
                const mine        = myEntry(comp.id);
                const canSubmit   = registration && comp.status === 'active' && !mine;

                return (
                  <div key={comp.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    {comp.cover_image && (
                      <div className="h-44 overflow-hidden">
                        <img src={comp.cover_image} alt={comp.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-display text-xl text-white">{comp.title}</h3>
                          {comp.theme && <p className="text-gold/70 font-body text-xs mt-0.5">Theme: {comp.theme}</p>}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-body tracking-wider uppercase flex-shrink-0 ${statusColors[comp.status]}`}>
                          {comp.status}
                        </span>
                      </div>

                      {comp.description && (
                        <p className="text-white/50 font-body text-sm leading-relaxed mb-4">{comp.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-white/40 font-body mb-5">
                        <span>
                          📅 {new Date(comp.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' – '}
                          {new Date(comp.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>📸 {compEntries.length} {compEntries.length === 1 ? 'entry' : 'entries'}</span>
                      </div>

                      {/* Photo strip */}
                      {compEntries.length > 0 && (
                        <div className="mb-5">
                          <p className="text-white/30 font-body text-[10px] uppercase tracking-wider mb-2">Entries</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {compEntries.map(entry => (
                              <div key={entry.id} className="flex-shrink-0 group relative rounded-lg overflow-hidden">
                                <img src={entry.photo_url} alt={entry.title || 'Entry'} className="w-20 h-20 object-cover" />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1.5">
                                  <p className="text-white font-body text-[9px] text-center leading-tight">
                                    {entry.competition_registrations?.first_name} {entry.competition_registrations?.last_name}
                                  </p>
                                  {entry.title && (
                                    <p className="text-gold font-body text-[9px] text-center leading-tight mt-0.5">{entry.title}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-auto">
                        {mine ? (
                          <div className="flex items-center gap-2 text-emerald-400 font-body text-sm">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                            Your photo has been submitted
                          </div>
                        ) : canSubmit ? (
                          <button
                            onClick={() => setUploadModal({ competitionId: comp.id, competitionTitle: comp.title })}
                            className="px-5 py-2.5 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold/90 transition-colors cursor-pointer border-none"
                          >
                            Submit Your Photo
                          </button>
                        ) : !registration && comp.status === 'active' ? (
                          <a href="#register" className="text-gold hover:text-gold/80 font-body text-sm transition-colors no-underline">
                            Register to submit your photo →
                          </a>
                        ) : comp.status !== 'active' ? (
                          <p className="text-white/30 font-body text-sm capitalize">{comp.status === 'closed' ? 'Competition closed' : `Opens when status changes to active`}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Hall of Fame ── */}
      <section id="hall-of-fame" className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Hall of Fame</p>
          <h2 className="font-display text-4xl text-white mb-3">Our Champions</h2>
          <p className="text-white/40 font-body text-sm mb-10">
            The finest wildlife photographers from Wild Vana expeditions.
          </p>

          {winners.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
              <p className="text-5xl mb-4">🏆</p>
              <p className="text-white/40 font-body">Winners will appear here after each competition closes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map(w => {
                const photo = winnerEntryPhoto(w);
                return (
                  <div key={w.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {photo ? (
                      <div className="h-52 overflow-hidden relative">
                        <img src={photo} alt="Winning photo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute top-3 left-3 text-3xl drop-shadow">{rankEmoji[w.rank]}</span>
                      </div>
                    ) : (
                      <div className="h-24 bg-white/5 flex items-center justify-center text-4xl">
                        {rankEmoji[w.rank]}
                      </div>
                    )}
                    <div className="p-5">
                      <div className={`font-body text-xs uppercase tracking-wider mb-1 ${rankColors[w.rank]}`}>
                        {rankLabel[w.rank]} Winner
                      </div>
                      <h3 className="font-display text-lg text-white">
                        {w.competition_registrations?.first_name} {w.competition_registrations?.last_name}
                      </h3>
                      <p className="text-white/40 font-body text-xs mt-0.5">{w.competitions?.title}</p>
                      {w.competitions?.theme && (
                        <p className="text-gold/50 font-body text-xs">Theme: {w.competitions.theme}</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <p className="text-emerald-400/80 font-body text-xs">🎁 15% off next tour</p>
                        {w.discount_valid_until && (
                          <p className="text-white/25 font-body text-xs">
                            till {new Date(w.discount_valid_until).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-white/10 text-center">
        <p className="text-white/25 font-body text-xs">
          © {new Date().getFullYear()} Wild Vana · Wildlife Photography Tours
        </p>
      </footer>

      {/* ── Upload Photo Modal ── */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/15 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl text-white">Submit Your Photo</h3>
                <p className="text-white/40 font-body text-xs mt-0.5">{uploadModal.competitionTitle}</p>
              </div>
              <button onClick={closeUploadModal}
                className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl h-52 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors overflow-hidden"
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-4">
                    <p className="text-4xl mb-2">📷</p>
                    <p className="text-white/50 font-body text-sm">Click to select your photo</p>
                    <p className="text-white/25 font-body text-xs mt-1">JPG, PNG · Max 10 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div>
                <label className={labelCls}>Photo Title</label>
                <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Give your photo a title" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Caption</label>
                <textarea value={uploadForm.caption} onChange={e => setUploadForm(f => ({ ...f, caption: e.target.value }))}
                  placeholder="Describe the moment you captured…"
                  rows={2} className={`${inputCls} resize-none`} />
              </div>
              {uploadError && <p className="text-red-400 font-body text-xs">{uploadError}</p>}
              <button disabled={uploadLoading}
                className="w-full py-3 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 cursor-pointer border-none">
                {uploadLoading ? 'Uploading…' : 'Submit Photo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
