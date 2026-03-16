import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CreditCard, Shield, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    if (result.error) { setError(result.error); setSubmitting(false); } else { navigate('/app'); }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0D0E11] to-[#161719] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5550]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF5550]/3 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-10 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="WispTap" className="w-10 h-10 rounded-lg" />
            <span className="text-white font-bold text-2xl tracking-tight">WispTap</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">Your crypto,<br />ready to spend.</h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10">Connect your Solana wallet, issue virtual Visa cards, and spend anywhere, all from one dashboard.</p>
          <div className="flex flex-col gap-4">
            {[
              { icon: <CreditCard size={18} />, text: 'Issue virtual Visa cards instantly' },
              { icon: <Zap size={18} />, text: 'Convert SOL to stablecoins in seconds' },
              { icon: <Shield size={18} />, text: 'Full card controls and real-time alerts' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FF5550]/10 flex items-center justify-center text-[#FF5550] shrink-0">{f.icon}</div>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="WispTap" className="w-9 h-9 rounded-lg" />
              <span className="text-white font-bold text-xl tracking-tight">WispTap</span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1.5">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-gray-400 text-xs font-semibold mb-1.5 block">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full bg-[#111215] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF5550]/40 focus:ring-1 focus:ring-[#FF5550]/20 focus:outline-none transition-all placeholder-gray-600 text-sm" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="text-gray-400 text-xs font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                  className="w-full bg-[#111215] text-white px-4 py-3 pr-11 rounded-xl border border-white/5 focus:border-[#FF5550]/40 focus:ring-1 focus:ring-[#FF5550]/20 focus:outline-none transition-all placeholder-gray-600 text-sm" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-[#FF5550] hover:bg-[#E84B47] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all mt-1 shadow-lg shadow-[#FF5550]/15">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#FF5550] font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
