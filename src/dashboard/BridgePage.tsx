import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ArrowLeftRight, ArrowRight, Plus, Globe, AlertCircle, CheckCircle, ArrowDownUp } from 'lucide-react';
import { api, type BridgeTransfer, type Chain } from '../lib/api';
import { useToast } from '../lib/toast';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import CurrencyBadge from '../components/CurrencyBadge';
import BridgeDepositModal from '../components/BridgeDepositModal';
import { motion } from 'framer-motion';

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const statusSteps = ['initiated', 'confirming', 'bridging', 'complete'];
const statusColors: Record<string, string> = {
  initiated: 'bg-yellow-500/10 text-yellow-400',
  confirming: 'bg-blue-500/10 text-blue-400',
  bridging: 'bg-[#0AF5D6]/10 text-[#0AF5D6]',
  complete: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
};

const statusDots: Record<string, string> = {
  initiated: 'bg-yellow-400',
  confirming: 'bg-blue-400 animate-pulse',
  bridging: 'bg-[#0AF5D6] animate-pulse',
  complete: 'bg-green-400',
  failed: 'bg-red-400',
};

function ChainLogo({ chainId, logo, size = 14, className = '' }: { chainId: string; logo?: string | null; size?: number; className?: string }) {
  if (logo) {
    return <img src={logo} alt={chainId} style={{ width: size, height: size }} className={`object-contain ${className}`} />;
  }
  return <Globe size={size} className={className} />;
}

function TokenLogo({ token, logo, size = 14, className = '' }: { token: string; logo?: string | null; size?: number; className?: string }) {
  if (logo) {
    return <img src={logo} alt={token} style={{ width: size, height: size }} className={`object-contain ${className}`} />;
  }
  return (
    <span
      style={{ width: size, height: size }}
      className={`rounded-full bg-green-500/10 flex items-center justify-center ${className}`}
    >
      <span className="text-green-400 font-bold" style={{ fontSize: size * 0.45 }}>{token.slice(0, 1)}</span>
    </span>
  );
}

function BridgeStatusTracker({ status }: { status: string }) {
  const currentIdx = statusSteps.indexOf(status);
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1">
        <AlertCircle size={12} className="text-red-400" />
        <span className="text-red-400 text-[10px] font-bold uppercase">Failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`w-2 h-2 rounded-full transition-all ${
            i <= currentIdx
              ? i === currentIdx && status !== 'complete' ? 'bg-green-400 animate-pulse' : 'bg-green-400'
              : 'bg-white/[0.08]'
          }`} />
          {i < statusSteps.length - 1 && (
            <div className={`w-4 h-0.5 ${i < currentIdx ? 'bg-green-400/40' : 'bg-white/[0.06]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BridgePage() {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<BridgeTransfer[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [chainsLoading, setChainsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const [sourceChain, setSourceChain] = useState('');
  const [destChain, setDestChain] = useState('');
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [addressError, setAddressError] = useState('');
  const [addressValidating, setAddressValidating] = useState(false);
  const validateTimeout = useRef<ReturnType<typeof setTimeout>>();

  const [depositModal, setDepositModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<BridgeTransfer | null>(null);

  const sourceChainData = chains.find((c) => c.id === sourceChain);
  const destChainData = chains.find((c) => c.id === destChain);

  const getChainById = useCallback((id: string) => chains.find(c => c.id === id), [chains]);
  const resolveChainLogo = useCallback((chainId: string) => getChainById(chainId)?.logo || null, [getChainById]);
  const resolveTokenLogo = useCallback((chainId: string, tok: string) => {
    const chain = getChainById(chainId);
    return chain?.tokenLogos?.[tok] || null;
  }, [getChainById]);

  const availableTokens = useMemo(() => {
    if (!sourceChainData) return [];
    if (!destChainData) return sourceChainData.tokens;
    return sourceChainData.tokens.filter((t) => destChainData.tokens.includes(t));
  }, [sourceChainData, destChainData]);

  useEffect(() => {
    api.bridge.chains()
      .then((data) => {
        setChains(data.chains);
        if (data.chains.length >= 2) {
          setSourceChain(data.chains[0].id);
          setDestChain(data.chains[2]?.id || data.chains[1].id);
          setToken(data.chains[0].tokens[0] || '');
        }
      })
      .catch(() => toast('error', 'Failed to load supported chains'))
      .finally(() => setChainsLoading(false));
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [filter]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(token)) {
      setToken(availableTokens[0]);
    }
  }, [sourceChain, destChain, availableTokens, token]);

  useEffect(() => {
    setAddressValid(null);
    setAddressError('');
    setRecipientAddress('');
  }, [destChain]);

  function loadTransfers() {
    setLoading(true);
    api.bridge.list({ status: filter })
      .then((data) => setTransfers(data.transfers))
      .catch(() => toast('error', 'Failed to load bridge history'))
      .finally(() => setLoading(false));
  }

  const validateAddress = useCallback((chainId: string, tok: string, address: string) => {
    if (validateTimeout.current) clearTimeout(validateTimeout.current);
    if (!address.trim()) {
      setAddressValid(null);
      setAddressError('');
      return;
    }
    setAddressValidating(true);
    validateTimeout.current = setTimeout(async () => {
      try {
        const result = await api.bridge.validateAddress(chainId, tok, address.trim());
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
    if (destChain && token) {
      validateAddress(destChain, token, recipientAddress);
    }
  }, [destChain, token, recipientAddress, validateAddress]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast('error', 'Enter a valid amount'); return; }
    if (!recipientAddress.trim()) { toast('error', 'Enter a recipient address'); return; }
    if (addressValid === false) { toast('error', addressError || 'Invalid recipient address'); return; }
    if (sourceChain === destChain) { toast('error', 'Source and destination must be different'); return; }

    setCreating(true);
    try {
      const data = await api.bridge.create({
        sourceChain,
        destChain,
        token,
        amount,
        recipientAddress: recipientAddress.trim(),
      });
      setTransfers((prev) => [data.transfer, ...prev]);
      setShowCreate(false);
      setAmount('');
      setRecipientAddress('');
      setAddressValid(null);
      setAddressError('');
      setPendingTransfer(data.transfer);
      setDepositModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate bridge';
      toast('error', message);
    } finally {
      setCreating(false);
    }
  }

  function swapChains() {
    const temp = sourceChain;
    setSourceChain(destChain);
    setDestChain(temp);
    setRecipientAddress('');
    setAddressValid(null);
    setAddressError('');
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Bridge</h1>
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/15 rounded-lg px-2.5 py-1">
              <Globe size={10} className="text-green-400" />
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">
                {chainsLoading ? '...' : `${chains.length} Chains`}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Anonymous cross-chain asset transfers</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={chainsLoading || chains.length === 0}
          className="bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Transfer</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {['all', 'initiated', 'confirming', 'bridging', 'complete', 'failed'].map((f) => (
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
          <ArrowLeftRight size={16} className="text-green-400" />
          <span className="text-white text-sm font-bold">Bridge History</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{transfers.length} transfers</span>}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="w-24 sm:w-40 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                  <div className="w-36 sm:w-24 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-14 sm:w-20 h-6 bg-white/[0.04] rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={28} />}
            title="No bridge transfers"
            description="Bridge assets across chains privately with zero trace."
            action={
              <button onClick={() => setShowCreate(true)} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                Start First Transfer
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => {
                  if (transfer.status === 'initiated' && transfer.depositAddress) {
                    setPendingTransfer(transfer);
                    setDepositModal(true);
                  }
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <TokenLogo token={transfer.token} logo={resolveTokenLogo(transfer.sourceChain, transfer.token)} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-white text-sm font-semibold">{parseFloat(transfer.amount).toLocaleString()} {transfer.token}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <ChainLogo chainId={transfer.sourceChain} logo={resolveChainLogo(transfer.sourceChain)} size={12} />
                    <span className="capitalize">{transfer.sourceChain}</span>
                    <ArrowRight size={10} />
                    <ChainLogo chainId={transfer.destChain} logo={resolveChainLogo(transfer.destChain)} size={12} />
                    <span className="capitalize">{transfer.destChain}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <BridgeStatusTracker status={transfer.status} />
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColors[transfer.status] || ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDots[transfer.status] || 'bg-gray-400'}`} />
                    {transfer.status}
                  </span>
                  <span className="text-gray-600 text-[10px] block mt-1">{timeAgo(transfer.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Bridge Transfer" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">From Chain</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {chains.map((c) => (
                <button
                  key={`src-${c.id}`}
                  type="button"
                  onClick={() => {
                    setSourceChain(c.id);
                    if (c.id === destChain) {
                      const other = chains.find(x => x.id !== c.id);
                      if (other) setDestChain(other.id);
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-max ${
                    sourceChain === c.id
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : c.id === destChain
                      ? 'bg-white/[0.01] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-40'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  disabled={c.id === destChain}
                >
                  <ChainLogo chainId={c.id} logo={c.logo} size={14} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center -my-1">
            <button
              type="button"
              onClick={swapChains}
              className="w-9 h-9 rounded-full bg-[#111111] border border-white/[0.08] hover:border-green-500/30 flex items-center justify-center transition-all hover:bg-green-500/5 group"
              title="Swap chains"
            >
              <ArrowDownUp size={15} className="text-gray-500 group-hover:text-green-400 transition-colors" />
            </button>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">To Chain</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {chains.map((c) => (
                <button
                  key={`dst-${c.id}`}
                  type="button"
                  onClick={() => {
                    setDestChain(c.id);
                    if (c.id === sourceChain) {
                      const other = chains.find(x => x.id !== c.id);
                      if (other) setSourceChain(other.id);
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-w-max ${
                    destChain === c.id
                      ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                      : c.id === sourceChain
                      ? 'bg-white/[0.01] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-40'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  disabled={c.id === sourceChain}
                >
                  <ChainLogo chainId={c.id} logo={c.logo} size={14} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {availableTokens.length === 0 && sourceChain && destChain ? (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs leading-relaxed">No tokens available for this chain pair. Select different source or destination chains.</p>
            </div>
          ) : (
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Token</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {availableTokens.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setToken(t)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      token === t
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <CurrencyBadge currency={t} size="sm" showLabel={false} />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <CurrencyBadge currency={token} size="sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Recipient Address
              <span className="text-gray-600 normal-case ml-1">({destChainData?.name || 'destination'})</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={`Enter ${destChainData?.name || 'destination'} wallet address`}
                className={`w-full bg-[#111111] rounded-xl px-3 sm:px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none transition-all font-mono text-[11px] sm:text-xs border ${
                  addressValid === true
                    ? 'border-green-500/40 focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20'
                    : addressValid === false
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
                    : 'border-white/[0.06] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20'
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
                Valid {destChainData?.name || 'destination'} address
              </motion.p>
            )}
          </div>

          <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3 flex items-start gap-2">
            <Globe size={14} className="text-green-400 shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">Bridge transfers use privacy-preserving routing across chains. No connection between source and destination is recorded.</p>
          </div>

          <button
            type="submit"
            disabled={creating || addressValid === false || sourceChain === destChain || !amount || availableTokens.length === 0}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ArrowLeftRight size={16} /> Initiate Bridge</>
            )}
          </button>
        </form>
      </Modal>

      {pendingTransfer && (
        <BridgeDepositModal
          open={depositModal}
          onClose={() => setDepositModal(false)}
          depositAddress={pendingTransfer.depositAddress || ''}
          amount={pendingTransfer.amount}
          token={pendingTransfer.token}
          sourceChain={pendingTransfer.sourceChain}
          destChain={pendingTransfer.destChain}
          recipientAddress={pendingTransfer.recipientAddress}
        />
      )}
    </div>
  );
}
