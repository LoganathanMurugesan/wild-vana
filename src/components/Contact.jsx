import { useScrollReveal } from '../hooks/useParallax';

export default function Contact() {
  const leftReveal = useScrollReveal(0.1);
  const formReveal = useScrollReveal(0.15);

  return (
    <section id="contact" className="relative bg-ink py-32 px-6 md:px-12 mb-48">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        <div ref={leftReveal.ref} style={leftReveal.style}>
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-3">Get In Touch</p>
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
                label: 'Email',
                value: 'hello@wildvana.com',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ),
                label: 'Phone',
                value: '+91 98765 43210',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                label: 'Office',
                value: 'New Delhi, India',
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
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">First Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors" placeholder="John" />
              </div>
              <div>
                <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Last Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Email</label>
              <input type="email" className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors" placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Interested In</label>
              <select className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white/70 font-body text-sm outline-none focus:border-gold transition-colors appearance-none cursor-pointer">
                <option value="">Select a destination</option>
                <option value="ranthambore">Ranthambore, India</option>
                <option value="kaziranga">Kaziranga, India</option>
                <option value="bharatpur">Bharatpur, India</option>
                <option value="corbett">Jim Corbett, India</option>
                <option value="gir">Gir Forest, India</option>
                <option value="masai-mara">Masai Mara, Kenya</option>
              </select>
            </div>
            <div>
              <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Message</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors resize-none" placeholder="Tell us about your dream safari..." />
            </div>
            <button type="submit" className="w-full py-3.5 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">
              Send Message
            </button>
          </form>
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
