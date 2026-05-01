import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tours: 0, gallery: 0, bookings: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('tours').select('id', { count: 'exact', head: true }),
      supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]).then(([t, g, b, p]) => {
      setStats({ tours: t.count ?? 0, gallery: g.count ?? 0, bookings: b.count ?? 0, pending: p.count ?? 0 });
    });
  }, []);

  const cards = [
    { label: 'Total Tours', value: stats.tours, to: '/admin/tours', color: 'text-gold' },
    { label: 'Gallery Images', value: stats.gallery, to: '/admin/gallery', color: 'text-emerald-400' },
    { label: 'Total Bookings', value: stats.bookings, to: '/admin/bookings', color: 'text-sky-400' },
    { label: 'Pending Enquiries', value: stats.pending, to: '/admin/bookings', color: 'text-amber-400' },
  ];

  const quickLinks = [
    { to: '/admin/tours', label: 'Add New Tour' },
    { to: '/admin/gallery', label: 'Upload Gallery Image' },
    { to: '/admin/slides', label: 'Manage Hero Slides' },
    { to: '/admin/bookings', label: 'View Enquiries' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-white font-display text-3xl mb-2">Dashboard</h1>
      <p className="text-white/40 font-body text-sm mb-10">Welcome back. Here's what's happening.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(card => (
          <Link key={card.label} to={card.to}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors no-underline">
            <p className={`font-display text-4xl font-semibold ${card.color}`}>{card.value}</p>
            <p className="text-white/50 font-body text-sm mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-white font-body text-sm tracking-[0.2em] uppercase mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        {quickLinks.map(link => (
          <Link key={link.label} to={link.to}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-gold hover:border-gold/30 font-body text-sm transition-colors no-underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
