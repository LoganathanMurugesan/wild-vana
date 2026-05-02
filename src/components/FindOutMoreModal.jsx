import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Singapore', 'United Arab Emirates', 'Germany', 'France', 'Other',
];

const inputCls = 'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors placeholder:text-white/30';
const labelCls = 'text-white/40 font-body text-xs uppercase tracking-wider block mb-1.5';

export default function FindOutMoreModal({ tourLocation, tourDestination, onClose }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    country: '', state: '', city: '', message: '', opt_in: false,
  });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const messageParts = [
      form.message && `Notes: ${form.message}`,
      form.phone && `Phone: ${form.phone}`,
      [form.city, form.state, form.country].filter(Boolean).join(', ') && `Location: ${[form.city, form.state, form.country].filter(Boolean).join(', ')}`,
      form.opt_in ? 'Opted in to email updates.' : null,
    ].filter(Boolean);

    const destinationLabel = tourLocation
      ? `${tourLocation}${tourDestination ? `, ${tourDestination}` : ''}`
      : '';

    const { error } = await supabase.from('bookings').insert([{
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      destination: destinationLabel,
      message: messageParts.join('\n'),
    }]);
    setStatus(error ? 'error' : 'success');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white tracking-wide">Find Out More</h2>
            {tourLocation && (
              <p className="text-white/40 font-body text-xs mt-0.5">
                Enquiring about: <span className="text-gold">{tourLocation}, {tourDestination}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white text-xl bg-transparent border-none cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2">Thank you!</h3>
            <p className="text-white/50 font-body text-sm mb-6">
              A destination specialist will be in touch within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-ink font-body text-sm font-semibold rounded-sm hover:bg-gold-dark transition-colors cursor-pointer border-none"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6 space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input required className={inputCls} placeholder="John" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input required className={inputCls} placeholder="Doe" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>

            {/* Contact row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <input required type="email" className={inputCls} placeholder="john@example.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className={labelCls}>Telephone Number</label>
                <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            {/* Location row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Country</label>
                <select className={`${inputCls} cursor-pointer appearance-none text-white/70`} value={form.country} onChange={set('country')}>
                  <option value="" className="bg-[#1a1a2e]">Select Country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} placeholder="State / Province" value={form.state} onChange={set('state')} />
              </div>
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input className={inputCls} placeholder="City" value={form.city} onChange={set('city')} />
            </div>

            <div>
              <label className={labelCls}>Budget, Plans &amp; Who Will Be Travelling</label>
              <textarea
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Tell us a little about your plans…"
                value={form.message}
                onChange={set('message')}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.opt_in} onChange={set('opt_in')} className="mt-1 accent-gold cursor-pointer" />
              <span className="text-white/50 font-body text-sm">
                I would like to receive emails about trip offers and availability updates
              </span>
            </label>

            <p className="text-white/30 font-body text-xs leading-relaxed">
              We are wildlife specialists, not led by commissions but instead by putting people in the right place at the right time.
              A destination specialist will be in touch — we don't do hard sales but you will get plenty of inspiration and advice.
            </p>

            <p className="text-white/30 font-body text-xs">
              By submitting this form, you confirm that you agree to our{' '}
              <a href="#" className="text-gold hover:underline">Terms &amp; Conditions</a>.
            </p>

            {status === 'error' && (
              <p className="text-red-400 font-body text-sm">Something went wrong. Please try again.</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex-1 py-3 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-60 border-none"
              >
                {status === 'sending' ? 'Sending…' : 'Submit Enquiry'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-white/15 text-white/60 font-body text-sm rounded-lg hover:border-white/30 hover:text-white transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
