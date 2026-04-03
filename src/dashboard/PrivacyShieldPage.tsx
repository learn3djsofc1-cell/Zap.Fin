import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Unlock, ArrowRight, Globe, Fingerprint, Zap, Eye, EyeOff, Loader2, Copy, Check, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type ShieldNetwork, type ShieldOperation, type ShieldBalance, type ShieldStats, type ShieldWallet } from '../lib/api';

type TabType = 'shield' | 'transfer' | 'unshield';
type HistoryFilter = 'all' | 'shield' | 'transfer' | 'unshield';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-500/10',
  proving: 'text-blue-400 bg-blue-500/10',
  confirmed: 'text-emerald-400 bg-emerald-500/10',
  complete: 'text-[#0AF5D6] bg-[#0AF5D6]/10',
  failed: 'text-red-400 bg-red-500/10',
};

export default function PrivacyShieldPage() {
  const [activeTab, setActiveTab] = useState<TabType>('shield');
  const [networks, setNetworks] = useState<ShieldNetwork[]>([]);
  const [wallet, setWallet] = useState<ShieldWallet | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [stats, setStats] = useState<ShieldStats | null>(null);
  const [operations, setOperations] = useState<ShieldOperation[]>([]);
  const [opsTotal, setOpsTotal] = useState(0);
  const [balances, setBalances] = useState<ShieldBalance[]>([]);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingWallet, setCreatingWallet] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [netRes, walletRes, statsRes, opsRes, balRes] = await Promise.all([
        api.shield.networks(),
        api.shield.wallet(),
        api.shield.stats(),
        api.shield.operations({ limit: 20, type: historyFilter === 'all' ? undefined : historyFilter }),
        api.shield.balances(),
      ]);
      setNetworks(netRes.networks);
      setWallet(walletRes.wallet);
      setEngineReady(walletRes.engineReady);
      setStats(statsRes.stats);
      setOperations(opsRes.operations);
      setOpsTotal(opsRes.total);
      setBalances(balRes.balances);
    } catch (err: any) {
      console.error('Failed to load shield data:', err);
    } finally {
      setLoading(false);
    }
  }, [historyFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [statsRes, opsRes, balRes] = await Promise.all([
          api.shield.stats(),
          api.shield.operations({ limit: 20, type: historyFilter === 'all' ? undefined : historyFilter }),
          api.shield.balances(),
        ]);
        setStats(statsRes.stats);
        setOperations(opsRes.operations);
        setOpsTotal(opsRes.total);
        setBalances(balRes.balances);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [historyFilter]);

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const availableTokens = currentNetwork?.tokens || [];

  useEffect(() => {
    if (selectedNetwork && !availableTokens.includes(selectedToken)) {
      setSelectedToken(availableTokens[0] || '');
    }
  }, [selectedNetwork, availableTokens, selectedToken]);

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    setError('');
    try {
      const res = await api.shield.createWallet();
      setWallet(res.wallet);
      setSuccess('Wallet created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!selectedNetwork) throw new Error('Select a network');
      if (!selectedToken) throw new Error('Select a token');
      if (!amount || parseFloat(amount) <= 0) throw new Error('Enter a valid amount');

      let result: { operation: ShieldOperation };

      if (activeTab === 'shield') {
        result = await api.shield.create({
          network: selectedNetwork,
          token: selectedToken,
          amount,
        });
      } else if (activeTab === 'transfer') {
        if (!addressInput.trim()) throw new Error('Enter a recipient 0zk address');
        result = await api.shield.transfer({
          network: selectedNetwork,
          token: selectedToken,
          amount,
          recipientAddress: addressInput.trim(),
        });
      } else {
        if (!addressInput.trim()) throw new Error('Enter a recipient EVM address');
        result = await api.shield.unshield({
          network: selectedNetwork,
          token: selectedToken,
          amount,
          recipientAddress: addressInput.trim(),
        });
      }

      setSuccess(`Operation submitted — ${result.operation.status}`);
      setAmount('');
      setAddressInput('');
      setTimeout(() => setSuccess(''), 4000);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const tabConfig = [
    { key: 'shield' as TabType, label: 'Shield', icon: Lock, desc: 'Public → Private', color: 'text-emerald-400' },
    { key: 'transfer' as TabType, label: 'Transfer', icon: Shield, desc: 'Private → Private', color: 'text-[#0AF5D6]' },
    { key: 'unshield' as TabType, label: 'Unshield', icon: Unlock, desc: 'Private → Public', color: 'text-amber-400' },
  ];

  const flowSteps = activeTab === 'shield'
    ? [{ icon: Globe, label: 'Public Wallet' }, { icon: Fingerprint, label: 'ZK-SNARK Proof' }, { icon: Shield, label: 'Privacy Pool' }]
    : activeTab === 'transfer'
    ? [{ icon: Shield, label: 'Sender Pool' }, { icon: Fingerprint, label: 'ZK-SNARK Proof' }, { icon: Shield, label: 'Receiver Pool' }]
    : [{ icon: Shield, label: 'Privacy Pool' }, { icon: Fingerprint, label: 'ZK-SNARK Proof' }, { icon: Globe, label: 'Public Wallet' }];

  const needsAddress = activeTab !== 'shield';
  const addressLabel = activeTab === 'transfer' ? 'Recipient 0zk Address' : 'Recipient Public Address';
  const addressPlaceholder = activeTab === 'transfer' ? '0zk...' : '0x...';
  const submitLabel = activeTab === 'shield' ? 'Shield Tokens' : activeTab === 'transfer' ? 'Private Transfer' : 'Unshield Tokens';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#0AF5D6]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-2rem)]">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
            <Shield size={20} className="text-[#0AF5D6]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Shield</h1>
            <p className="text-gray-500 text-sm">ZK-SNARK Private Transfers — Powered by Railgun</p>
          </div>
        </div>
      </div>

      {wallet && (
        <div className="mb-4 p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.04] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-[#0AF5D6]" />
            <span className="text-gray-400 text-xs">Railgun:</span>
            <span className="text-white text-xs font-mono truncate max-w-[200px]">{wallet.railgunAddress.substring(0, 20)}...</span>
            <button onClick={() => copyToClipboard(wallet.railgunAddress, 'railgun')} className="text-gray-500 hover:text-[#0AF5D6] transition-colors">
              {copied === 'railgun' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-blue-400" />
            <span className="text-gray-400 text-xs">EVM:</span>
            <span className="text-white text-xs font-mono truncate max-w-[200px]">{wallet.evmAddress}</span>
            <button onClick={() => copyToClipboard(wallet.evmAddress, 'evm')} className="text-gray-500 hover:text-[#0AF5D6] transition-colors">
              {copied === 'evm' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${engineReady ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
            <span className="text-gray-500 text-[10px]">{engineReady ? 'Engine Ready' : 'Engine Loading'}</span>
          </div>
        </div>
      )}

      {!wallet && (
        <div className="mb-6 p-6 bg-[#0A0A0A] rounded-2xl border border-[#0AF5D6]/10 text-center">
          <Wallet size={32} className="mx-auto text-[#0AF5D6] mb-3" />
          <h3 className="text-white font-bold mb-2">Create Your Privacy Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">Generate a Railgun wallet to start shielding your transactions with ZK-SNARK proofs.</p>
          <button
            onClick={handleCreateWallet}
            disabled={creatingWallet || !engineReady}
            className="px-6 py-2.5 bg-[#0AF5D6] text-black font-bold rounded-xl text-sm hover:bg-[#0AF5D6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            {creatingWallet ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {creatingWallet ? 'Creating...' : 'Create Wallet'}
          </button>
          {!engineReady && (
            <p className="text-yellow-400/80 text-xs mt-3">Railgun engine is initializing. Please wait...</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Shielded Ops', value: stats?.totalShielded.toString() || '0', icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Private Transfers', value: stats?.totalPrivateTransfers.toString() || '0', icon: Shield, color: 'text-[#0AF5D6]', bg: 'bg-[#0AF5D6]/10' },
          { label: 'Privacy Score', value: stats?.privacyScore.toString() || '0', icon: Fingerprint, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Networks', value: stats?.networksUsed.toString() || '0', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0A0A0A] rounded-2xl p-4 border border-white/[0.04]">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={14} className={s.color} />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white block">{s.value}</span>
            <span className="text-gray-500 text-[10px] sm:text-xs block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
            <div className="flex border-b border-white/[0.04]">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 sm:py-4 text-xs sm:text-sm font-medium relative transition-colors ${
                    activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.key ? tab.color : ''} />
                  <span>{tab.label}</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-600">{tab.desc}</span>
                  {activeTab === tab.key && (
                    <motion.div layoutId="shield-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0AF5D6]" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
                {flowSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
                        <step.icon size={18} className="text-[#0AF5D6]" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 text-center max-w-[70px] sm:max-w-[80px] leading-tight">{step.label}</span>
                    </div>
                    {i < 2 && <ArrowRight size={16} className="text-[#0AF5D6]/50 mt-[-16px]" />}
                  </div>
                ))}
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Network</label>
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white appearance-none cursor-pointer focus:border-[#0AF5D6]/30 focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#0A0A0A]">Select Network</option>
                    {networks.map(n => (
                      <option key={n.id} value={n.id} className="bg-[#0A0A0A]">{n.name} (Chain {n.chainId})</option>
                    ))}
                  </select>
                </div>

                {selectedNetwork && (
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Token</label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableTokens.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedToken(t)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border text-center transition-colors ${
                            selectedToken === t
                              ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border-[#0AF5D6]/20'
                              : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:border-white/[0.12]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    min="0"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:border-[#0AF5D6]/30 focus:outline-none transition-colors"
                  />
                </div>

                {needsAddress && (
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">{addressLabel}</label>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder={addressPlaceholder}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 font-mono text-xs focus:border-[#0AF5D6]/30 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {currentNetwork && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <Zap size={12} className="text-[#0AF5D6] shrink-0" />
                    <span className="text-gray-500 text-[10px] sm:text-xs truncate">
                      Contract: <span className="text-gray-400 font-mono">{currentNetwork.relayAdapt.substring(0, 10)}...{currentNetwork.relayAdapt.substring(36)}</span>
                    </span>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <AlertCircle size={14} className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-xs">{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                    >
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 text-xs">{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !wallet || !engineReady || !selectedNetwork || !selectedToken || !amount}
                  className="w-full py-3 sm:py-3.5 bg-[#0AF5D6] text-black font-bold rounded-xl text-sm hover:bg-[#0AF5D6]/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating ZK Proof...
                    </>
                  ) : (
                    submitLabel
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={14} className="text-[#0AF5D6]" />
              <span className="text-white text-sm font-bold">Supported Networks</span>
              <span className="text-gray-600 text-[10px]">({networks.length} active)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {networks.map(net => (
                <div key={net.id} className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-semibold">{net.name}</span>
                    <span className="text-gray-600 text-[10px]">Chain {net.chainId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {net.tokens.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[10px] text-gray-400">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint size={14} className="text-[#0AF5D6]" />
                  <span className="text-white text-sm font-bold">Operation History</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs">{opsTotal} ops</span>
                  <button onClick={loadData} className="text-gray-500 hover:text-[#0AF5D6] transition-colors">
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(['all', 'shield', 'transfer', 'unshield'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${
                      historyFilter === f
                        ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20'
                        : 'text-gray-500 border border-transparent hover:text-gray-400'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {operations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#0AF5D6]/10 flex items-center justify-center">
                  <Shield size={24} className="text-[#0AF5D6]" />
                </div>
                <p className="text-white text-sm font-medium mb-1">No operations yet</p>
                <p className="text-gray-500 text-xs">Shield, transfer, or unshield tokens to see your history here.</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {operations.map(op => (
                  <div key={op.id} className="px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {op.operationType === 'shield' && <Lock size={12} className="text-emerald-400" />}
                        {op.operationType === 'transfer' && <Shield size={12} className="text-[#0AF5D6]" />}
                        {op.operationType === 'unshield' && <Unlock size={12} className="text-amber-400" />}
                        <span className="text-white text-xs font-medium capitalize">{op.operationType}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_COLORS[op.status] || 'text-gray-400'}`}>
                        {op.status === 'proving' && <Loader2 size={8} className="inline animate-spin mr-1" />}
                        {op.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">{op.amount} {op.token} on {op.network}</span>
                      <span className="text-gray-600 text-[10px]">{new Date(op.createdAt).toLocaleString()}</span>
                    </div>
                    {op.txHash && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-gray-600 text-[10px]">TX:</span>
                        <span className="text-gray-500 text-[10px] font-mono">{op.txHash.substring(0, 10)}...{op.txHash.substring(58)}</span>
                        <button onClick={() => copyToClipboard(op.txHash!, 'tx-' + op.id)} className="text-gray-600 hover:text-[#0AF5D6]">
                          {copied === 'tx-' + op.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <EyeOff size={14} className="text-[#0AF5D6]" />
              <span className="text-white text-sm font-bold">Shielded Balances</span>
            </div>
            {balances.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Eye size={20} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 text-xs">No shielded balances</p>
              </div>
            ) : (
              <div className="space-y-2">
                {balances.map((b, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Shield size={12} className="text-[#0AF5D6]" />
                      <span className="text-white text-sm font-medium">{b.token}</span>
                      <span className="text-gray-600 text-[10px]">{b.network}</span>
                    </div>
                    <span className="text-[#0AF5D6] text-sm font-bold font-mono">{b.shieldedBalance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
