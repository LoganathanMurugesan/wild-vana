import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-2">Wild Vana</p>
          <h1 className="text-white font-display text-3xl">Admin Portal</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-5">
          <div>
            <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors"
              placeholder="admin@wildvana.com"
            />
          </div>
          <div>
            <label className="text-white/40 font-body text-xs uppercase tracking-wider block mb-2">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white font-body text-sm outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 font-body text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-gold text-ink font-body font-semibold text-sm tracking-wider uppercase rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-gold font-body text-sm transition-colors no-underline">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
