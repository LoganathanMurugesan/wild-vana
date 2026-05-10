import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useParallax';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const leftReveal = useScrollReveal(0.1);
  const formReveal = useScrollReveal(0.15);

  const [tours, setTours] = useState([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', destination: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    supabase.from('tours').select('id, location, destination').eq('published', true).order('sort_order')
      .then(({ data }) => { if (data) setTours(data); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('bookings').insert([form]);
    setStatus(error ? 'error' : 'success');
    if (!error) setForm({ first_name: '', last_name: '', email: '', destination: '', message: '' });
  };

  const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors';

  return (
    <section id="contact" className="relative bg-ink py-24 px-6 md:px-12">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6">Get In Touch</p>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        <div ref={leftReveal.ref} style={leftReveal.style}>
          <h2 className="text-white font-display text-4xl md:text-5xl leading-tight mb-6">Contact Us</h2>
          <p className="text-white/60 font-body leading-relaxed mb-10">
            Ready to embark on your next wildlife photography adventure? Reach out and our team will help you choose the perfect expedition.
          </p>

          <div className="space-y-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                label: 'Email', value: 'Info@wildvana.com',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ),
                label: 'Phone', value: '9790313433',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                label: 'Location', value: 'Chennai, India',
              },
            ].map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <p className="text-white/40 font-body text-xs uppercase tracking-wider">{info.label}</p>
                  <p className="text-white font-body mt-0.5">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-10">
            {['Instagram', 'YouTube', 'Facebook'].map((p) => (
              <a key={p} href="#" className="px-4 py-2 border border-white/15 rounded-full text-white/50 font-body text-xs tracking-wider uppercase hover:border-gold hover:text-gold transition-colors no-underline">
                {p}
              </a>
            ))}
          </div>
        </div>

        <div ref={formReveal.ref} style={formReveal.style} className="bg-white/5 border border-white/10 rounded-xl p-8 md:p-10">
          <h3 className="text-white font-display text-2xl mb-6">Send a Message</h3>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-white font-display text-xl">Message Sent!</p>
              <p className="text-white/50 font-body text-sm">We'll get back to you within 24 hours.</p>
              <button onClick={() => setStatus('idle')} className="mt-2 text-gold font-body text-sm underline cursor-pointer bg-transparent border-none">
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">First Name</label>
                  <input required type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className={inputCls} placeholder="First name" />
                </div>
                <div>
                  <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Last Name</label>
                  <input required type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className={inputCls} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="Your email address" />
              </div>
              <div>
                <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Interested In</label>
                <select value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} className={`${inputCls} text-white/70 appearance-none cursor-pointer`}>
                  <option value="">Select a destination</option>
                  {tours.map(t => (
                    <option key={t.id} value={t.location}>{t.location}, {t.destination}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Message</label>
                <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Tell us about your dream safari..." />
              </div>
              {status === 'error' && (
                <p className="text-red-400 font-body text-sm">Something went wrong. Please try again.</p>
              )}
              <button type="submit" disabled={status === 'sending'} className="w-full py-3.5 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-60">
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/30 font-body text-sm">© 2026 Wild Vana. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service'].map((item) => (
            <a key={item} href="#" className="text-white/30 hover:text-gold font-body text-sm transition-colors no-underline">{item}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
