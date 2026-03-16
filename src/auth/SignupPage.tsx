import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Wallet, CreditCard, Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Passwords match', met: password.length > 0 && password === confirmPassword },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSubmitting(true);
    const result = await signup(email, password);
    if (result.error) { setError(result.error); setSubmitting(false); } else { navigate('/app'); }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0D0E11] to-[#161719] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF5550]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FF5550]/3 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/logo.png" alt="WispTap" className="w-10 h-10 rounded-lg" />
            <span className="text-white font-bold text-2xl tracking-tight">WispTap</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">Start spending<br />crypto today.</h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10">Create your account in 30 seconds. No KYC, no waiting — just connect and go.</p>

          <div className="bg-[#161719] rounded-2xl border border-white/5 p-5 mb-6">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-4">What you get</span>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Wallet size={18} />, title: 'Solana Wallet', desc: 'Self-custody wallet generated instantly' },
                { icon: <CreditCard size={18} />, title: 'Virtual Visa Cards', desc: 'Issue up to 2 virtual cards on demand' },
                { icon: <Zap size={18} />, title: 'Instant Conversions', desc: 'Swap SOL to USDC/USDT with live rates' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FF5550]/10 flex items-center justify-center text-[#FF5550] shrink-0 mt-0.5">{f.icon}</div>
                  <div><span className="text-white text-sm font-semibold block">{f.title}</span><span className="text-gray-500 text-xs">{f.desc}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex -space-x-2">
              {['#FF5550', '#9945FF', '#2775CA', '#26A17B'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0E11] flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c }}>{String.fromCharCode(65 + i)}</div>
              ))}
            </div>
            <span className="text-gray-400 text-xs">Join 10,000+ users</span>
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

          <h1 className="text-2xl font-extrabold text-white mb-1.5">Create your account</h1>
          <p className="text-gray-500 text-sm mb-7">Free to start. No credit card required.</p>

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
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                  className="w-full bg-[#111215] text-white px-4 py-3 pr-11 rounded-xl border border-white/5 focus:border-[#FF5550]/40 focus:ring-1 focus:ring-[#FF5550]/20 focus:outline-none transition-all placeholder-gray-600 text-sm" placeholder="Create a strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-gray-400 text-xs font-semibold mb-1.5 block">Confirm password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
                className="w-full bg-[#111215] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF5550]/40 focus:ring-1 focus:ring-[#FF5550]/20 focus:outline-none transition-all placeholder-gray-600 text-sm" placeholder="Re-enter your password" />
            </div>

            {password.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {passwordChecks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className={c.met ? 'text-green-400' : 'text-gray-600'} />
                    <span className={`text-xs ${c.met ? 'text-green-400' : 'text-gray-500'}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#FF5550] hover:bg-[#E84B47] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all mt-1 shadow-lg shadow-[#FF5550]/15">
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF5550] font-semibold hover:underline">Sign in</Link>
          </p>

          <p className="text-center text-gray-600 text-[11px] mt-4 leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
