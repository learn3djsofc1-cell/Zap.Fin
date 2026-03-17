import { useEffect, useState } from 'react';
import { ArrowLeftRight, ArrowRight, Plus, Globe, AlertCircle } from 'lucide-react';
import { api, type BridgeTransfer, type Chain } from '../lib/api';
import { useToast } from '../lib/toast';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
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
              ? i === currentIdx && status !== 'complete' ? 'bg-[#0AF5D6] animate-pulse' : 'bg-green-400'
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

  const sourceChainData = chains.find((c) => c.id === sourceChain);
  const destChainData = chains.find((c) => c.id === destChain);

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
    const chain = chains.find((c) => c.id === sourceChain);
    if (chain && !chain.tokens.includes(token)) {
      setToken(chain.tokens[0] || '');
    }
  }, [sourceChain, chains, token]);

  function loadTransfers() {
    setLoading(true);
    api.bridge.list({ status: filter })
      .then((data) => setTransfers(data.transfers))
      .catch(() => toast('error', 'Failed to load bridge history'))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast('error', 'Enter a valid amount'); return; }
    if (!recipientAddress.trim()) { toast('error', 'Enter a recipient address'); return; }
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
      toast('success', 'Bridge transfer initiated');
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Bridge</h1>
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/15 rounded-lg px-2.5 py-1">
              <Globe size={10} className="text-green-400" />
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">
                {chainsLoading ? '...' : `${chains.length} Chains`}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Anonymous cross-chain asset transfers</p>
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
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <ArrowLeftRight size={16} className="text-green-400" />
          <span className="text-white text-sm font-bold">Bridge History</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{transfers.length} transfers</span>}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="flex-1">
                  <div className="w-40 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                  <div className="w-24 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-20 h-6 bg-white/[0.04] rounded animate-pulse" />
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
              <div key={transfer.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <ArrowLeftRight size={16} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-sm font-semibold">{parseFloat(transfer.amount).toLocaleString()} {transfer.token}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <span className="capitalize">{transfer.sourceChain}</span>
                    <ArrowRight size={10} />
                    <span className="capitalize">{transfer.destChain}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <BridgeStatusTracker status={transfer.status} />
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider sm:hidden ${statusColors[transfer.status] || ''}`}>
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
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">From Chain</label>
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0AF5D6]/40 transition-all appearance-none"
              >
                {chains.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === destChain}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={swapChains}
              className="mt-6 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-[#0AF5D6] hover:border-[#0AF5D6]/30 transition-all shrink-0"
            >
              <ArrowLeftRight size={16} />
            </button>
            <div className="flex-1">
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">To Chain</label>
              <select
                value={destChain}
                onChange={(e) => setDestChain(e.target.value)}
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0AF5D6]/40 transition-all appearance-none"
              >
                {chains.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === sourceChain}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Token</label>
            <div className="flex gap-2 flex-wrap">
              {sourceChainData?.tokens.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setToken(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    token === t
                      ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {t}
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
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Recipient Address on {destChainData?.name || 'destination chain'}</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter destination wallet address"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all font-mono text-xs"
            />
          </div>

          <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3 flex items-start gap-2">
            <Globe size={14} className="text-green-400 shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">Bridge transfers use privacy-preserving routing across chains. No connection between source and destination is recorded.</p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ArrowLeftRight size={16} /> Initiate Bridge</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
