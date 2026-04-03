import { useEffect, useState, useCallback, useMemo } from 'react';
import { Shield, Lock, Unlock, ArrowRight, Copy, Check, Eye, EyeOff, ChevronDown, AlertCircle, Zap, Globe, Fingerprint } from 'lucide-react';
import { api, type RailgunOperation, type RailgunNetwork, type RailgunBalance, type RailgunStats } from '../lib/api';
import { useToast } from '../lib/toast';
import EmptyState from '../components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

type OperationTab = 'shield' | 'transfer' | 'unshield';

const statusSteps = ['pending', 'proving', 'confirmed', 'complete'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  proving: 'bg-blue-500/10 text-blue-400',
  confirmed: 'bg-[#0AF5D6]/10 text-[#0AF5D6]',
  complete: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
};
const statusDots: Record<string, string> = {
  pending: 'bg-yellow-400',
  proving: 'bg-blue-400 animate-pulse',
  confirmed: 'bg-[#0AF5D6] animate-pulse',
  complete: 'bg-green-400',
  failed: 'bg-red-400',
};

function timeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-500" />}
    </button>
  );
}

function FlowDiagram({ type }: { type: OperationTab }) {
  const steps = type === 'shield'
    ? [{ icon: Globe, label: 'Public Wallet' }, { icon: Fingerprint, label: 'ZK-SNARK Proof' }, { icon: Shield, label: 'Privacy Pool' }]
    : type === 'transfer'
    ? [{ icon: Shield, label: 'Sender Pool' }, { icon: Fingerprint, label: 'ZK Proof Verified' }, { icon: Shield, label: 'Recipient Pool' }]
    : [{ icon: Shield, label: 'Privacy Pool' }, { icon: Fingerprint, label: 'ZK-SNARK Proof' }, { icon: Globe, label: 'Public Wallet' }];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
              <step.icon size={18} className="text-[#0AF5D6]" />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 text-center max-w-[70px] sm:max-w-[80px] leading-tight">{step.label}</span>
          </div>
          {i < steps.length - 1 && <ArrowRight size={16} className="text-[#0AF5D6]/50 mt-[-16px]" />}
        </div>
      ))}
    </div>
  );
}

function PrivacyGuarantees({ type }: { type: OperationTab }) {
  const items = type === 'shield'
    ? ['Balance hidden from chain observers', 'Only deposit amount visible on-chain', 'Private note commitment received']
    : type === 'transfer'
    ? ['Sender address hidden', 'Receiver address hidden', 'Transfer amount hidden']
    : ['Shielded balance converted to ERC-20', 'Receiver address becomes public', 'ZK proof validates withdrawal'];

  return (
    <div className="space-y-2 mt-3">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0AF5D6]/60 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function StatusTracker({ status }: { status: string }) {
  const currentIdx = statusSteps.indexOf(status);
  const isFailed = status === 'failed';

  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            isFailed ? 'bg-red-400/30' :
            i <= currentIdx ? 'bg-[#0AF5D6]' : 'bg-white/10'
          }`} />
          {i < statusSteps.length - 1 && (
            <div className={`w-3 sm:w-5 h-0.5 ${
              isFailed ? 'bg-red-400/20' :
              i < currentIdx ? 'bg-[#0AF5D6]/50' : 'bg-white/5'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function NetworkSelect({ networks, value, onChange }: { networks: RailgunNetwork[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = networks.find(n => n.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white hover:border-[#0AF5D6]/20 transition-colors"
      >
        <span>{selected?.name || 'Select Network'}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-20 w-full mt-1 bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl"
          >
            {networks.map(n => (
              <button
                key={n.id}
                onClick={() => { onChange(n.id); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                  n.id === value ? 'text-[#0AF5D6] bg-[#0AF5D6]/5' : 'text-gray-300'
                }`}
              >
                {n.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PrivacyShieldPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<OperationTab>('shield');
  const [networks, setNetworks] = useState<RailgunNetwork[]>([]);
  const [operations, setOperations] = useState<RailgunOperation[]>([]);
  const [balances, setBalances] = useState<RailgunBalance[]>([]);
  const [stats, setStats] = useState<RailgunStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const [network, setNetwork] = useState('');
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceAddress, setSourceAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const selectedNetwork = useMemo(() => networks.find(n => n.id === network), [networks, network]);
  const availableTokens = useMemo(() => selectedNetwork?.tokens || [], [selectedNetwork]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(token)) {
      setToken(availableTokens[0]);
    }
  }, [availableTokens, token]);

  const loadData = useCallback(async () => {
    try {
      const [networksRes, opsRes, balRes, statsRes] = await Promise.allSettled([
        api.railgun.networks(),
        api.railgun.operations(),
        api.railgun.balances(),
        api.railgun.stats(),
      ]);
      if (networksRes.status === 'fulfilled') {
        setNetworks(networksRes.value.networks);
        setNetwork(prev => {
          if (!prev && networksRes.value.networks.length > 0) {
            return networksRes.value.networks[0].id;
          }
          return prev;
        });
      }
      if (opsRes.status === 'fulfilled') setOperations(opsRes.value.operations);
      if (balRes.status === 'fulfilled') setBalances(balRes.value.balances);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
    } catch {
      toast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    if (!network || !token || !amount) {
      toast('error', 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = { network, token, amount };
      if (activeTab === 'shield') body.sourceAddress = sourceAddress;
      if (activeTab === 'transfer' || activeTab === 'unshield') body.recipientAddress = recipientAddress;

      let result: { operation: RailgunOperation };
      if (activeTab === 'shield') result = await api.railgun.shield(body);
      else if (activeTab === 'transfer') result = await api.railgun.transfer(body);
      else result = await api.railgun.unshield(body);

      setOperations(prev => [result.operation, ...prev]);
      toast('success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} operation initiated`);
      setAmount('');
      setSourceAddress('');
      setRecipientAddress('');
      loadData();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOps = useMemo(() => {
    if (historyFilter === 'all') return operations;
    return operations.filter(op => op.operationType === historyFilter);
  }, [operations, historyFilter]);

  const tabConfig: Record<OperationTab, { label: string; icon: typeof Shield; desc: string; color: string }> = {
    shield: { label: 'Shield', icon: Lock, desc: 'Public → Private', color: 'text-emerald-400' },
    transfer: { label: 'Transfer', icon: Shield, desc: 'Private → Private', color: 'text-[#0AF5D6]' },
    unshield: { label: 'Unshield', icon: Unlock, desc: 'Private → Public', color: 'text-amber-400' },
  };

  const opTypeLabels: Record<string, string> = { shield: 'Shield', transfer: 'Transfer', unshield: 'Unshield' };
  const opTypeColors: Record<string, string> = {
    shield: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    transfer: 'bg-[#0AF5D6]/10 text-[#0AF5D6] border-[#0AF5D6]/20',
    unshield: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const privacyScore = stats?.privacyScore ?? 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
            <Shield size={20} className="text-[#0AF5D6]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Shield</h1>
            <p className="text-gray-500 text-sm">Railgun Protocol — ZK-SNARK Private Transfers</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Shielded Ops', value: stats?.totalShielded ?? 0, icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Private Transfers', value: stats?.totalPrivateTransfers ?? 0, icon: Shield, color: 'text-[#0AF5D6]', bg: 'bg-[#0AF5D6]/10' },
          { label: 'Privacy Score', value: privacyScore, icon: Fingerprint, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Networks Used', value: stats?.networksUsed ?? 0, icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="bg-[#0A0A0A] rounded-2xl p-4 border border-white/[0.04] hover:border-[#0AF5D6]/15 transition-all"
          >
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={14} className={s.color} />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white block">{loading ? '—' : s.value}</span>
            <span className="text-gray-500 text-[10px] sm:text-xs block">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {balances.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-6">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <EyeOff size={14} className="text-[#0AF5D6]" />
              <span className="text-white text-sm font-bold">Shielded Balances</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {balances.map(b => {
                const net = networks.find(n => n.id === b.network);
                return (
                  <div key={`${b.network}-${b.token}`} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#0AF5D6]/10 flex items-center justify-center">
                        <Shield size={12} className="text-[#0AF5D6]" />
                      </div>
                      <div>
                        <span className="text-white text-sm font-semibold">{b.shieldedBalance} {b.token}</span>
                        <span className="text-gray-500 text-[10px] block">{net?.name || b.network}</span>
                      </div>
                    </div>
                    <Eye size={14} className="text-gray-600" />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
            <div className="flex border-b border-white/[0.04]">
              {(['shield', 'transfer', 'unshield'] as OperationTab[]).map(tab => {
                const cfg = tabConfig[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all relative ${
                      activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <cfg.icon size={18} className={activeTab === tab ? cfg.color : ''} />
                    <span>{cfg.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-600">{cfg.desc}</span>
                    {activeTab === tab && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0AF5D6]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6">
              <FlowDiagram type={activeTab} />

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Network</label>
                  <NetworkSelect networks={networks} value={network} onChange={setNetwork} />
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Token</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTokens.map(t => (
                      <button
                        key={t}
                        onClick={() => setToken(t)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          token === t
                            ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border-[#0AF5D6]/20'
                            : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:border-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/30 transition-colors"
                  />
                </div>

                {activeTab === 'shield' && (
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Source Public Address</label>
                    <input
                      value={sourceAddress}
                      onChange={e => setSourceAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/30 transition-colors font-mono text-xs"
                    />
                  </div>
                )}

                {(activeTab === 'transfer' || activeTab === 'unshield') && (
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">
                      {activeTab === 'transfer' ? 'Recipient Railgun Address' : 'Destination Public Address'}
                    </label>
                    <input
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                      placeholder={activeTab === 'transfer' ? '0zk...' : '0x...'}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/30 transition-colors font-mono text-xs"
                    />
                  </div>
                )}

                {selectedNetwork && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <Zap size={12} className="text-[#0AF5D6] shrink-0" />
                    <span className="text-gray-500 text-[10px] sm:text-xs truncate">
                      Relay Adapt: <span className="text-gray-400 font-mono">{selectedNetwork.relayAdapt}</span>
                    </span>
                    <CopyButton text={selectedNetwork.relayAdapt} />
                  </div>
                )}

                <PrivacyGuarantees type={activeTab} />

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !network || !token || !amount}
                  className="w-full py-3 sm:py-3.5 bg-[#0AF5D6] hover:bg-[#09E0C4] disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl transition-all text-sm"
                >
                  {submitting ? 'Processing...' : `${tabConfig[activeTab].label} ${token || 'Tokens'}`}
                </button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe size={14} className="text-[#0AF5D6]" />
              <span className="text-white text-sm font-bold">Supported Networks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {networks.map(net => (
                <div key={net.id} className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-semibold">{net.name}</span>
                    <span className="text-gray-600 text-[10px]">Chain {net.chainId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {net.tokens.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[10px] text-gray-400">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-[10px] font-mono truncate flex-1">{net.relayAdapt}</span>
                    <CopyButton text={net.relayAdapt} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint size={14} className="text-[#0AF5D6]" />
                  <span className="text-white text-sm font-bold">Operation History</span>
                </div>
                {!loading && <span className="text-gray-600 text-xs">{filteredOps.length} ops</span>}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['all', 'shield', 'transfer', 'unshield'].map(f => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
                      historyFilter === f
                        ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20'
                        : 'text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="divide-y divide-white/[0.03]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 sm:px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                      <div className="flex-1">
                        <div className="w-24 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                        <div className="w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOps.length === 0 ? (
              <EmptyState
                icon={<Shield size={28} />}
                title="No operations yet"
                description="Shield, transfer, or unshield tokens to see your history here."
              />
            ) : (
              <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
                {filteredOps.map(op => {
                  const net = networks.find(n => n.id === op.network);
                  return (
                    <div key={op.id} className="px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          op.operationType === 'shield' ? 'bg-emerald-500/10' :
                          op.operationType === 'transfer' ? 'bg-[#0AF5D6]/10' : 'bg-amber-500/10'
                        }`}>
                          {op.operationType === 'shield' ? <Lock size={16} className="text-emerald-400" /> :
                           op.operationType === 'transfer' ? <Shield size={16} className="text-[#0AF5D6]" /> :
                           <Unlock size={16} className="text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${opTypeColors[op.operationType]}`}>
                              {opTypeLabels[op.operationType]}
                            </span>
                            <span className="text-white text-sm font-semibold">{op.amount} {op.token}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-gray-500 text-[10px]">{net?.name || op.network}</span>
                            <span className="text-gray-700 text-[10px]">·</span>
                            <span className="text-gray-600 text-[10px]">{timeAgo(op.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusTracker status={op.status} />
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusColors[op.status] || ''}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusDots[op.status] || ''}`} />
                              {op.status}
                            </span>
                          </div>
                          {op.zkProofHash && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Fingerprint size={10} className="text-gray-600" />
                              <span className="text-gray-600 text-[10px] font-mono truncate">{op.zkProofHash.slice(0, 18)}...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
