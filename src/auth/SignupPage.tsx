import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { ApiError } from '../lib/api';

export default function SignupPage() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0AF5D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-[#0AF5D6]/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/ghostlane-logo.png" alt="GhostLane" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-2xl font-bold tracking-tight text-white">GhostLane</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
          <p className="text-gray-500 text-sm mt-2">Start protecting your digital privacy today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0A0A0A] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-colors"
              autoComplete="name"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-colors"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-colors"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0AF5D6] hover:text-[#08D4B8] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
