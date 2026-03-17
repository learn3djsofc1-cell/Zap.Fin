import { useEffect, useState } from 'react';
import { Shuffle, Clock, Shield, Zap, ChevronDown, Plus, Lock } from 'lucide-react';
import { api, type MixOperation } from '../lib/api';
import { useToast } from '../lib/toast';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import CurrencyBadge from '../components/CurrencyBadge';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_COINS = ['BTC', 'ETH', 'XMR', 'LTC', 'DASH', 'ZEC', 'BCH', 'DOGE'];

const PRIVACY_LEVELS = [
  { value: 'standard', label: 'Standard', desc: 'Basic mixing with moderate anonymity set', icon: Shield, time: '~15 min' },
  { value: 'enhanced', label: 'Enhanced', desc: 'Multi-hop mixing with larger pool', icon: Zap, time: '~30 min' },
  { value: 'maximum', label: 'Maximum', desc: 'ZK-proof mixing with maximum anonymity', icon: Lock, time: '~60 min' },
] as const;

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  mixing: 'bg-[#0AF5D6]/10 text-[#0AF5D6]',
  complete: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
};

const statusDots: Record<string, string> = {
  pending: 'bg-yellow-400',
  mixing: 'bg-[#0AF5D6] animate-pulse',
  complete: 'bg-green-400',
  failed: 'bg-red-400',
};

export default function MixerPage() {
  const { toast } = useToast();
  const [mixes, setMixes] = useState<MixOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    loadMixes();
  }, [filter]);

  function loadMixes() {
    setLoading(true);
    api.mixer.list({ status: filter })
      .then((data) => setMixes(data.mixes))
      .catch(() => toast('error', 'Failed to load mixing history'))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast('error', 'Enter a valid amount'); return; }
    if (!recipient.trim()) { toast('error', 'Enter a recipient address'); return; }

    setCreating(true);
    try {
      const data = await api.mixer.create({
        coin,
        amount,
        recipientAddress: recipient.trim(),
        privacyLevel,
        delayMinutes: delay > 0 ? delay : undefined,
      });
      setMixes((prev) => [data.mix, ...prev]);
      setShowCreate(false);
      setAmount('');
      setRecipient('');
      toast('success', 'Mix operation initiated');
    } catch (err: any) {
      toast('error', err.message || 'Failed to create mix');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Mixer</h1>
            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/15 rounded-lg px-2.5 py-1">
              <Lock size={10} className="text-purple-400" />
              <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">ZK-Proof</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Break transaction links with zero-knowledge proofs</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Mix</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {['all', 'pending', 'mixing', 'complete', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20'
                : 'text-gray-500 hover:text-gray-300 border border-white/[0.04] hover:border-white/[0.08]'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <Shuffle size={16} className="text-purple-400" />
          <span className="text-white text-sm font-bold">Mixing History</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{mixes.length} operations</span>}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="flex-1">
                  <div className="w-32 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                  <div className="w-48 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : mixes.length === 0 ? (
          <EmptyState
            icon={<Shuffle size={28} />}
            title="No mixing operations"
            description="Start your first mix to break transaction links and enhance your privacy."
            action={
              <button onClick={() => setShowCreate(true)} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                Create First Mix
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {mixes.map((mix) => (
              <div key={mix.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Shuffle size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-sm font-semibold">{parseFloat(mix.amount).toLocaleString()}</span>
                    <CurrencyBadge currency={mix.coin} size="sm" />
                  </div>
                  <span className="text-gray-500 text-xs block truncate">
                    To: {mix.recipientAddress.slice(0, 8)}...{mix.recipientAddress.slice(-6)}
                  </span>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <span className="text-gray-500 text-xs capitalize">{mix.privacyLevel}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColors[mix.status] || ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDots[mix.status] || 'bg-gray-400'}`} />
                    {mix.status}
                  </span>
                  <span className="text-gray-600 text-[10px] block mt-1">{timeAgo(mix.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Mix Operation" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Select Asset</label>
            <div className="grid grid-cols-4 gap-2">
              {SUPPORTED_COINS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoin(c)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    coin === c
                      ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <CurrencyBadge currency={c} size="sm" showLabel={false} />
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter destination wallet address"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Privacy Level</label>
            <div className="space-y-2">
              {PRIVACY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPrivacyLevel(level.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    privacyLevel === level.value
                      ? 'border-[#0AF5D6]/30 bg-[#0AF5D6]/5'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    privacyLevel === level.value ? 'bg-[#0AF5D6]/15 text-[#0AF5D6]' : 'bg-white/[0.04] text-gray-500'
                  }`}>
                    <level.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block ${privacyLevel === level.value ? 'text-[#0AF5D6]' : 'text-white'}`}>{level.label}</span>
                    <span className="text-gray-500 text-xs block">{level.desc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={12} />
                    <span className="text-xs">{level.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Delay (Optional)
              <span className="text-gray-600 normal-case ml-1">— adds time between mix steps</span>
            </label>
            <div className="flex gap-2">
              {[0, 15, 30, 60, 120].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelay(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    delay === d
                      ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {d === 0 ? 'None' : `${d}m`}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Shuffle size={16} /> Initiate Mix</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
