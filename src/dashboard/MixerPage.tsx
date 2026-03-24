import { useEffect, useState, useCallback, useRef } from 'react';
import { Shuffle, Clock, Shield, Zap, Plus, Lock, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { api, type MixOperation, type MixPool } from '../lib/api';
import { useToast } from '../lib/toast';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import CurrencyBadge from '../components/CurrencyBadge';
import DepositPendingModal from '../components/DepositPendingModal';
import { motion } from 'framer-motion';

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

function formatPoolSize(size: number): string {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return String(size);
}

export default function MixerPage() {
  const { toast } = useToast();
  const [mixes, setMixes] = useState<MixOperation[]>([]);
  const [pools, setPools] = useState<MixPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');
  const [delay, setDelay] = useState(0);

  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [addressError, setAddressError] = useState('');
  const [addressValidating, setAddressValidating] = useState(false);
  const validateTimeout = useRef<ReturnType<typeof setTimeout>>();

  const [depositModal, setDepositModal] = useState(false);
  const [pendingMix, setPendingMix] = useState<MixOperation | null>(null);

  useEffect(() => {
    loadMixes();
  }, [filter]);

  useEffect(() => {
    api.mixer.pools()
      .then((data) => setPools(data.pools))
      .catch(() => toast('error', 'Failed to load pool data'))
      .finally(() => setPoolsLoading(false));
  }, []);

  const supportedCoins = pools.length > 0
    ? pools.map((p) => p.coin)
    : ['BTC', 'ETH', 'XMR', 'LTC', 'DASH', 'ZEC', 'BCH', 'DOGE'];

  function loadMixes() {
    setLoading(true);
    api.mixer.list({ status: filter })
      .then((data) => setMixes(data.mixes))
      .catch(() => toast('error', 'Failed to load mixing history'))
      .finally(() => setLoading(false));
  }

  const validateAddress = useCallback((coinType: string, address: string) => {
    if (validateTimeout.current) clearTimeout(validateTimeout.current);
    if (!address.trim()) {
      setAddressValid(null);
      setAddressError('');
      return;
    }
    setAddressValidating(true);
    validateTimeout.current = setTimeout(async () => {
      try {
        const result = await api.mixer.validateAddress(coinType, address.trim());
        setAddressValid(result.valid);
        setAddressError(result.error || '');
      } catch {
        setAddressValid(null);
        setAddressError('');
      } finally {
        setAddressValidating(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    validateAddress(coin, recipient);
  }, [coin, recipient, validateAddress]);

  useEffect(() => {
    setAddressValid(null);
    setAddressError('');
  }, [coin]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast('error', 'Enter a valid amount'); return; }
    if (!recipient.trim()) { toast('error', 'Enter a recipient address'); return; }
    if (addressValid === false) { toast('error', addressError || 'Invalid recipient address'); return; }

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
      setAddressValid(null);
      setAddressError('');
      setPendingMix(data.mix);
      setDepositModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create mix';
      toast('error', message);
    } finally {
      setCreating(false);
    }
  }

  function getPoolForCoin(coinName: string): MixPool | undefined {
    return pools.find((p) => p.coin === coinName);
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
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {poolsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] rounded-xl border border-white/[0.04] p-4">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse mb-3" />
              <div className="w-16 h-4 bg-white/[0.04] rounded animate-pulse mb-1" />
              <div className="w-12 h-3 bg-white/[0.04] rounded animate-pulse" />
            </div>
          ))
        ) : pools.length === 0 ? (
          <div className="col-span-full bg-[#0A0A0A] rounded-xl border border-white/[0.04] p-4 text-center">
            <Database size={16} className="text-gray-600 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">No pool data available</p>
          </div>
        ) : (
          pools.slice(0, 8).map((pool) => (
            <div key={pool.coin} className="bg-[#0A0A0A] rounded-xl border border-white/[0.04] p-4 hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyBadge currency={pool.coin} size="sm" showLabel={false} />
                <span className="text-white text-sm font-bold">{pool.coin}</span>
              </div>
              <div className="flex items-center gap-1">
                <Database size={10} className="text-purple-400" />
                <span className="text-white text-sm font-semibold">{formatPoolSize(pool.size)}</span>
                <span className="text-gray-500 text-[10px]">pool size</span>
              </div>
            </div>
          ))
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
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
        <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-white/[0.04]">
          <Shuffle size={16} className="text-purple-400" />
          <span className="text-white text-sm font-bold">Mixing History</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{mixes.length} operations</span>}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="w-24 sm:w-32 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                  <div className="w-36 sm:w-48 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-14 sm:w-16 h-6 bg-white/[0.04] rounded animate-pulse shrink-0" />
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
              <div
                key={mix.id}
                className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => {
                  if (mix.status === 'pending' && mix.depositAddress) {
                    setPendingMix(mix);
                    setDepositModal(true);
                  }
                }}
              >
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
              {supportedCoins.map((c) => {
                const pool = getPoolForCoin(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoin(c)}
                    className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                      coin === c
                        ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <CurrencyBadge currency={c} size="sm" showLabel={false} />
                      <span className="text-[10px] sm:text-xs">{c}</span>
                    </div>
                    {pool && (
                      <span className="text-[8px] sm:text-[9px] text-gray-600 font-normal">
                        {formatPoolSize(pool.size)} pool
                      </span>
                    )}
                  </button>
                );
              })}
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
            <div className="relative">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={`Enter ${coin} destination wallet address`}
                className={`w-full bg-[#111111] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none transition-all font-mono text-[11px] sm:text-xs border ${
                  addressValid === true
                    ? 'border-green-500/40 focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20'
                    : addressValid === false
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
                    : 'border-white/[0.06] focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {addressValidating && (
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                )}
                {!addressValidating && addressValid === true && (
                  <CheckCircle size={16} className="text-green-400" />
                )}
                {!addressValidating && addressValid === false && (
                  <AlertCircle size={16} className="text-red-400" />
                )}
              </div>
            </div>
            {addressValid === false && addressError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1"
              >
                <AlertCircle size={10} />
                {addressError}
              </motion.p>
            )}
            {addressValid === true && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-[11px] mt-1.5 flex items-center gap-1"
              >
                <CheckCircle size={10} />
                Valid {coin} address
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Privacy Level</label>
            <div className="space-y-2">
              {PRIVACY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPrivacyLevel(level.value)}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl border transition-all text-left ${
                    privacyLevel === level.value
                      ? 'border-[#0AF5D6]/30 bg-[#0AF5D6]/5'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    privacyLevel === level.value ? 'bg-[#0AF5D6]/15 text-[#0AF5D6]' : 'bg-white/[0.04] text-gray-500'
                  }`}>
                    <level.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block ${privacyLevel === level.value ? 'text-[#0AF5D6]' : 'text-white'}`}>{level.label}</span>
                    <span className="text-gray-500 text-[11px] sm:text-xs block">{level.desc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 shrink-0">
                    <Clock size={12} />
                    <span className="text-[11px] sm:text-xs">{level.time}</span>
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
            <div className="flex gap-2 flex-wrap">
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
            disabled={creating || addressValid === false}
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

      {pendingMix && (
        <DepositPendingModal
          open={depositModal}
          onClose={() => setDepositModal(false)}
          depositAddress={pendingMix.depositAddress || ''}
          amount={pendingMix.amount}
          coin={pendingMix.coin}
          privacyLevel={pendingMix.privacyLevel}
        />
      )}
    </div>
  );
}
