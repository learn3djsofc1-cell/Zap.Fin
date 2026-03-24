import { useEffect, useState, useCallback, useRef } from 'react';
import { Shuffle, Clock, Shield, Zap, Plus, Lock, Database, CheckCircle, AlertCircle, ArrowDownUp, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { api, type MixOperation, type MixPool, type MixRates } from '../lib/api';
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

const SUPPORTED_COINS = ['BTC', 'ETH', 'XMR', 'LTC', 'DASH', 'ZEC', 'BCH', 'DOGE'];

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

  const [sendCoin, setSendCoin] = useState('BTC');
  const [receiveCoin, setReceiveCoin] = useState('ETH');
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');
  const [delay, setDelay] = useState(0);

  const [rates, setRates] = useState<MixRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState('');

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

  useEffect(() => {
    loadRates();
  }, []);

  function loadRates() {
    setRatesLoading(true);
    api.mixer.rates()
      .then((data) => { setRates(data); setRatesError(false); })
      .catch(() => { setRatesError(true); toast('error', 'Unable to fetch exchange rates. Prices may be unavailable.'); })
      .finally(() => setRatesLoading(false));
  }

  useEffect(() => {
    computeReceiveAmount();
  }, [sendCoin, receiveCoin, sendAmount, rates]);

  function computeReceiveAmount() {
    if (!rates || !sendAmount || parseFloat(sendAmount) <= 0) {
      setReceiveAmount('');
      return;
    }
    const sendPrice = rates.prices[sendCoin];
    const receivePrice = rates.prices[receiveCoin];
    if (!sendPrice || !receivePrice) {
      setReceiveAmount('');
      return;
    }
    const exchangeRate = sendPrice / receivePrice;
    const gross = parseFloat(sendAmount) * exchangeRate;
    const net = gross * (1 - rates.feePercent / 100);
    setReceiveAmount(parseFloat(net.toPrecision(8)).toString());
  }

  function loadMixes() {
    setLoading(true);
    api.mixer.list({ status: filter })
      .then((data) => setMixes(data.mixes))
      .catch(() => toast('error', 'Failed to load mixing history'))
      .finally(() => setLoading(false));
  }

  function handleSwapCoins() {
    const temp = sendCoin;
    setSendCoin(receiveCoin);
    setReceiveCoin(temp);
    setRecipient('');
    setAddressValid(null);
    setAddressError('');
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
    validateAddress(receiveCoin, recipient);
  }, [receiveCoin, recipient, validateAddress]);

  useEffect(() => {
    setAddressValid(null);
    setAddressError('');
    setRecipient('');
  }, [receiveCoin]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sendAmount || parseFloat(sendAmount) <= 0) { toast('error', 'Enter a valid send amount'); return; }
    if (!recipient.trim()) { toast('error', 'Enter a recipient address'); return; }
    if (addressValid === false) { toast('error', addressError || 'Invalid recipient address'); return; }
    if (sendCoin === receiveCoin) { toast('error', 'Send and receive coins must be different'); return; }

    setCreating(true);
    try {
      const data = await api.mixer.create({
        sendCoin,
        receiveCoin,
        sendAmount,
        recipientAddress: recipient.trim(),
        privacyLevel,
        delayMinutes: delay > 0 ? delay : undefined,
      });
      setMixes((prev) => [data.mix, ...prev]);
      setShowCreate(false);
      setSendAmount('');
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

  function getExchangeRateDisplay(): string {
    if (!rates) return '';
    const sp = rates.prices[sendCoin];
    const rp = rates.prices[receiveCoin];
    if (!sp || !rp) return '';
    const rate = sp / rp;
    return `1 ${sendCoin} ≈ ${parseFloat(rate.toPrecision(6)).toLocaleString()} ${receiveCoin}`;
  }

  function getUsdValue(coin: string, amount: string): string {
    if (!rates || !amount || parseFloat(amount) <= 0) return '';
    const price = rates.prices[coin];
    if (!price) return '';
    const val = parseFloat(amount) * price;
    return `≈ $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-6 sm:mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Mixer</h1>
            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/15 rounded-lg px-2.5 py-1">
              <Lock size={10} className="text-purple-400" />
              <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">ZK-Proof</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Swap assets across chains with zero-knowledge privacy</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); loadRates(); }}
          className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Swap</span>
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
            <div key={pool.coin} className="bg-[#0A0A0A] rounded-xl border border-white/[0.04] p-3 sm:p-4 hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyBadge currency={pool.coin} size="sm" showLabel={false} />
                <span className="text-white text-sm font-bold">{pool.coin}</span>
              </div>
              <div className="flex items-center gap-1">
                <Database size={10} className="text-purple-400" />
                <span className="text-white text-sm font-semibold">{formatPoolSize(pool.size)}</span>
                <span className="text-gray-500 text-[10px]">pool</span>
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
          <span className="text-white text-sm font-bold">Swap History</span>
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
            title="No swap operations"
            description="Start your first privacy swap to break transaction links across chains."
            action={
              <button onClick={() => { setShowCreate(true); loadRates(); }} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                Create First Swap
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
                  <ArrowRightLeft size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm font-semibold">{parseFloat(mix.sendAmount).toLocaleString()}</span>
                      <CurrencyBadge currency={mix.sendCoin} size="sm" />
                    </div>
                    <ArrowRightLeft size={11} className="text-gray-500" />
                    <div className="flex items-center gap-1">
                      <span className="text-[#0AF5D6] text-sm font-semibold">{parseFloat(mix.receiveAmount).toLocaleString()}</span>
                      <CurrencyBadge currency={mix.receiveCoin} size="sm" />
                    </div>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Privacy Swap" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">You Send</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {SUPPORTED_COINS.map((c) => (
                <button
                  key={`send-${c}`}
                  type="button"
                  onClick={() => {
                    setSendCoin(c);
                    if (c === receiveCoin) {
                      const other = SUPPORTED_COINS.find(x => x !== c);
                      if (other) setReceiveCoin(other);
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    sendCoin === c
                      ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                      : c === receiveCoin
                      ? 'bg-white/[0.01] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-40'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  disabled={c === receiveCoin}
                >
                  <CurrencyBadge currency={c} size="sm" showLabel={false} />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Send Amount</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <CurrencyBadge currency={sendCoin} size="sm" />
              </div>
            </div>
            {sendAmount && rates && (
              <p className="text-gray-500 text-[11px] mt-1">{getUsdValue(sendCoin, sendAmount)}</p>
            )}
          </div>

          <div className="flex items-center justify-center -my-1">
            <button
              type="button"
              onClick={handleSwapCoins}
              className="w-9 h-9 rounded-full bg-[#111111] border border-white/[0.08] hover:border-[#0AF5D6]/30 flex items-center justify-center transition-all hover:bg-[#0AF5D6]/5 group"
              title="Swap coins"
            >
              <ArrowDownUp size={15} className="text-gray-500 group-hover:text-[#0AF5D6] transition-colors" />
            </button>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">You Receive</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {SUPPORTED_COINS.map((c) => (
                <button
                  key={`recv-${c}`}
                  type="button"
                  onClick={() => {
                    setReceiveCoin(c);
                    if (c === sendCoin) {
                      const other = SUPPORTED_COINS.find(x => x !== c);
                      if (other) setSendCoin(other);
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    receiveCoin === c
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : c === sendCoin
                      ? 'bg-white/[0.01] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-40'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  disabled={c === sendCoin}
                >
                  <CurrencyBadge currency={c} size="sm" showLabel={false} />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {(receiveAmount || ratesLoading || ratesError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#111111] border border-white/[0.06] rounded-xl p-3 sm:p-4"
            >
              {ratesLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-xs">Loading rates...</span>
                </div>
              ) : ratesError ? (
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <AlertCircle size={14} />
                  <span className="text-xs">Unable to fetch rates.</span>
                  <button type="button" onClick={loadRates} className="text-[#0AF5D6] text-xs underline hover:no-underline">Retry</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">Estimated Receive</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#0AF5D6] text-base sm:text-lg font-bold">{parseFloat(receiveAmount).toLocaleString()}</span>
                      <CurrencyBadge currency={receiveCoin} size="sm" />
                    </div>
                  </div>
                  {receiveAmount && rates && (
                    <p className="text-gray-500 text-[11px] text-right mb-1">{getUsdValue(receiveCoin, receiveAmount)}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1 text-gray-500">
                      <TrendingUp size={11} />
                      <span className="text-[10px]">{getExchangeRateDisplay()}</span>
                    </div>
                    <span className="text-gray-500 text-[10px]">Fee: {rates?.feePercent ?? 1.5}%</span>
                  </div>
                </>
              )}
            </motion.div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Recipient Address
              <span className="text-gray-600 normal-case ml-1">({receiveCoin})</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={`Enter ${receiveCoin} wallet address`}
                className={`w-full bg-[#111111] rounded-xl px-3 sm:px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none transition-all font-mono text-[11px] sm:text-xs border ${
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
                Valid {receiveCoin} address
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Privacy Level</label>
            <div className="space-y-1.5">
              {PRIVACY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPrivacyLevel(level.value)}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all text-left ${
                    privacyLevel === level.value
                      ? 'border-[#0AF5D6]/30 bg-[#0AF5D6]/5'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    privacyLevel === level.value ? 'bg-[#0AF5D6]/15 text-[#0AF5D6]' : 'bg-white/[0.04] text-gray-500'
                  }`}>
                    <level.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block ${privacyLevel === level.value ? 'text-[#0AF5D6]' : 'text-white'}`}>{level.label}</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs block leading-tight">{level.desc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 shrink-0">
                    <Clock size={11} />
                    <span className="text-[10px] sm:text-xs">{level.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Delay
              <span className="text-gray-600 normal-case ml-1">(optional)</span>
            </label>
            <div className="flex gap-1.5 sm:gap-2">
              {[0, 15, 30, 60, 120].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelay(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${
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
            disabled={creating || addressValid === false || sendCoin === receiveCoin || !sendAmount}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ArrowRightLeft size={16} /> Initiate Swap</>
            )}
          </button>
        </form>
      </Modal>

      {pendingMix && (
        <DepositPendingModal
          open={depositModal}
          onClose={() => setDepositModal(false)}
          depositAddress={pendingMix.depositAddress || ''}
          sendAmount={pendingMix.sendAmount}
          sendCoin={pendingMix.sendCoin}
          receiveAmount={pendingMix.receiveAmount}
          receiveCoin={pendingMix.receiveCoin}
          exchangeRate={pendingMix.exchangeRate}
          feePercent={pendingMix.feePercent}
          recipientAddress={pendingMix.recipientAddress}
          privacyLevel={pendingMix.privacyLevel}
        />
      )}
    </div>
  );
}
