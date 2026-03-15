import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);

    const result = await signup(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity mb-6">
            <img src="/logo.png" alt="Zap.Fin" className="w-10 h-10 rounded-lg" />
            <span className="text-white font-bold text-2xl tracking-tight">Zap.Fin</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create your account</h1>
          <p className="text-gray-400 text-sm mt-2">Get started with Zap.Fin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111215] rounded-2xl p-6 sm:p-8 border border-white/5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#0A0B0E] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF6940]/50 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-[#0A0B0E] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF6940]/50 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-[#0A0B0E] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF6940]/50 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF6940] hover:bg-[#E55E39] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-bold text-sm transition-colors mt-2"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6940] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
