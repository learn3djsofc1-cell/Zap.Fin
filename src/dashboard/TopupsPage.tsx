import { useState, useEffect, useCallback } from 'react';
import { Wallet, Copy, Check, Loader2, AlertTriangle, ExternalLink, RefreshCw, ArrowDown } from 'lucide-react';

interface WalletData {
  id: number;
  address: string;
  confirmed: boolean;
  created_at: string;
}

interface Prices {
  sol: number;
  usdc: number;
  usdt: number;
  stale?: boolean;
}

interface Balance {
  sol: number;
  lamports: number;
}

export default function TopupsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showKeyFlow, setShowKeyFlow] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [prices, setPrices] = useState<Prices | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState<'usdc' | 'usdt'>('usdc');
  const [solAmount, setSolAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    try {
      const res = await fetch('/api/prices/sol');
      if (res.ok) {
        setPrices(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoadingPrices(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await fetch('/api/wallet/balance');
      if (res.ok) {
        setBalance(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (wallet?.confirmed) {
      fetchPrices();
      fetchBalance();
      const interval = setInterval(fetchPrices, 30_000);
      return () => clearInterval(interval);
    }
  }, [wallet?.confirmed, fetchPrices, fetchBalance]);

  const createWallet = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletAddress(data.address);
        setPrivateKey(data.privateKey);
        setShowKeyFlow(true);
      }
    } catch (err) {
      console.error('Failed to create wallet:', err);
    } finally {
      setCreating(false);
    }
  };

  const confirmWallet = async () => {
    setConfirming(true);
    try {
      const res = await fetch('/api/wallet/confirm', { method: 'POST' });
      if (res.ok) {
        setShowKeyFlow(false);
        setPrivateKey('');
        await fetchWallet();
      }
    } catch (err) {
      console.error('Failed to confirm wallet:', err);
    } finally {
      setConfirming(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'address') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    if (type === 'key') {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } else {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const solValue = parseFloat(solAmount) || 0;
  const solPrice = prices?.sol ?? 0;
  const targetPrice = targetCurrency === 'usdc' ? (prices?.usdc ?? 1) : (prices?.usdt ?? 1);
  const receiveAmount = solPrice > 0 ? (solValue * solPrice) / targetPrice : 0;
  const rate = solPrice > 0 ? solPrice / targetPrice : 0;
  const solBalance = balance?.sol ?? 0;

  const setPercentage = (pct: number) => {
    const amount = solBalance * (pct / 100);
    setSolAmount(amount > 0 ? amount.toFixed(6) : '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#FF5550]" size={32} />
      </div>
    );
  }

  if (showKeyFlow) {
    return (
      <div className="max-w-2xl mx-auto pb-20 md:pb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Wallet Created</h1>

        <div className="bg-[#111215] rounded-2xl p-6 border border-white/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-[#FF5550]" />
            <span className="text-white font-bold">Wallet Address</span>
          </div>
          <div className="bg-[#0A0B0E] rounded-xl p-4 flex items-center justify-between gap-3">
            <code className="text-[#FF5550] text-sm break-all flex-1 font-mono">{walletAddress}</code>
            <button
              onClick={() => copyToClipboard(walletAddress, 'address')}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
            >
              {addressCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-[#111215] rounded-2xl p-6 border border-red-500/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-400" />
            <span className="text-red-400 font-bold">Private Key — Save This Now</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            This key will only be shown once. If you lose it, you will lose access to your wallet and any funds in it. Copy and store it securely.
          </p>
          <div className="bg-[#0A0B0E] rounded-xl p-4 flex items-center justify-between gap-3 mb-4">
            <code className="text-red-300 text-xs break-all flex-1 font-mono">{privateKey}</code>
            <button
              onClick={() => copyToClipboard(privateKey, 'key')}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
            >
              {keyCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-white/20 bg-[#1A1B1F] text-[#FF5550] focus:ring-[#FF5550] focus:ring-offset-0 accent-[#FF5550]"
            />
            <span className="text-white text-sm font-medium">
              I have securely saved my private key and understand it will not be shown again
            </span>
          </label>
        </div>
        <button
          onClick={confirmWallet}
          disabled={!confirmed || confirming}
          className="w-full bg-[#FF5550] hover:bg-[#E84B47] text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF5550]/20"
        >
          {confirming ? <Loader2 size={18} className="animate-spin" /> : null}
          {confirming ? 'Confirming...' : 'Continue to Top-ups'}
        </button>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="max-w-5xl mx-auto pb-20 md:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Top-up Balance</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#111215] border border-white/5 flex items-center justify-center mb-6">
            <Wallet size={36} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Create a Solana Wallet</h2>
          <p className="text-gray-400 text-sm text-center max-w-md mb-8">
            You need a Solana wallet to top up your balance. Create one to get started with deposits and conversions.
          </p>
          <button
            onClick={createWallet}
            disabled={creating}
            className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 px-8 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#FF5550]/20 disabled:opacity-50"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
            {creating ? 'Creating...' : 'Create Solana Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (!wallet.confirmed) {
    return (
      <div className="max-w-2xl mx-auto pb-20 md:pb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Confirm Your Wallet</h1>
        <div className="bg-[#111215] rounded-2xl p-6 border border-white/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-[#FF5550]" />
            <span className="text-white font-bold">Wallet Address</span>
          </div>
          <div className="bg-[#0A0B0E] rounded-xl p-4">
            <code className="text-[#FF5550] text-sm break-all font-mono">{wallet.address}</code>
          </div>
        </div>
        <div className="bg-[#111215] rounded-2xl p-6 border border-yellow-500/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold">Confirmation Required</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Your wallet was created but you haven't confirmed that you saved the private key. The private key cannot be shown again. If you have it saved, confirm below to continue.
          </p>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-white/20 bg-[#1A1B1F] text-[#FF5550] focus:ring-[#FF5550] focus:ring-offset-0 accent-[#FF5550]"
            />
            <span className="text-white text-sm font-medium">
              I have securely saved my private key
            </span>
          </label>
        </div>
        <button
          onClick={confirmWallet}
          disabled={!confirmed || confirming}
          className="w-full bg-[#FF5550] hover:bg-[#E84B47] text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF5550]/20"
        >
          {confirming ? <Loader2 size={18} className="animate-spin" /> : null}
          {confirming ? 'Confirming...' : 'Confirm & Continue'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Top-up Balance</h1>
        <button
          onClick={() => { fetchBalance(); fetchPrices(); }}
          disabled={loadingBalance || loadingPrices}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={loadingBalance || loadingPrices ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#111215] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-[#FF5550]" />
                <span className="text-white font-bold">Wallet Balance</span>
              </div>
              {prices?.stale && (
                <span className="text-yellow-400 text-xs">Prices may be outdated</span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {loadingBalance ? '...' : solBalance.toFixed(4)}
              </span>
              <span className="text-gray-400 text-lg">SOL</span>
            </div>
            {prices && (
              <span className="text-gray-500 text-sm">
                ≈ ${(solBalance * solPrice).toFixed(2)} USD
              </span>
            )}

            <div className="bg-[#0A0B0E] rounded-xl p-3 mt-4 flex items-center justify-between gap-3">
              <code className="text-[#FF5550] text-xs break-all flex-1 font-mono">{wallet.address}</code>
              <button
                onClick={() => copyToClipboard(wallet.address, 'address')}
                className="text-gray-400 hover:text-white transition-colors shrink-0"
              >
                {addressCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <a
              href={`https://solscan.io/account/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF5550] text-xs font-medium hover:underline flex items-center gap-1 mt-2"
            >
              View on Solscan <ExternalLink size={12} />
            </a>
          </div>

          <div className="bg-[#111215] rounded-2xl p-6 border border-white/5">
            <span className="text-white font-bold block mb-5">Convert SOL</span>

            <div className="bg-[#0A0B0E] rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">You Send</span>
                <span className="text-gray-500 text-xs">
                  Balance: {solBalance.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="any"
                  className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="bg-[#1A1B1F] px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                  <img src="/sol-logo.png" alt="SOL" className="w-5 h-5 rounded-full" />
                  <span className="text-white text-sm font-bold">SOL</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {[25, 50, 75].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setPercentage(pct)}
                    className="bg-[#1A1B1F] hover:bg-[#222326] border border-white/5 text-gray-300 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => setPercentage(100)}
                  className="bg-[#FF5550]/10 hover:bg-[#FF5550]/20 border border-[#FF5550]/20 text-[#FF5550] text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#1A1B1F] border-4 border-[#111215] flex items-center justify-center">
                <ArrowDown size={16} className="text-[#FF5550]" />
              </div>
            </div>

            <div className="bg-[#0A0B0E] rounded-xl p-4 mt-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">You Receive</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-white text-2xl font-bold">
                  {receiveAmount > 0 ? receiveAmount.toFixed(2) : '0.00'}
                </span>
                <div className="flex bg-[#1A1B1F] rounded-lg border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setTargetCurrency('usdc')}
                    className={`px-3 py-2 text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      targetCurrency === 'usdc'
                        ? 'bg-[#FF5550] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <img src="/usdc-logo.png" alt="USDC" className="w-4 h-4 rounded-full" />
                    USDC
                  </button>
                  <button
                    onClick={() => setTargetCurrency('usdt')}
                    className={`px-3 py-2 text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      targetCurrency === 'usdt'
                        ? 'bg-[#FF5550] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <img src="/usdt-logo.png" alt="USDT" className="w-4 h-4 rounded-full" />
                    USDT
                  </button>
                </div>
              </div>
            </div>

            {prices && (
              <div className="mt-4 text-center">
                <span className="text-gray-500 text-xs">
                  1 SOL ≈ {rate.toFixed(2)} {targetCurrency.toUpperCase()}
                  {loadingPrices && ' (updating...)'}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={solValue <= 0 || solValue > solBalance || !prices}
              className="w-full mt-5 bg-[#FF5550] hover:bg-[#E84B47] text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF5550]/20"
            >
              {solValue > solBalance ? 'Insufficient Balance' : 'Convert'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Live Prices</span>
            {prices ? (
              <div className="flex flex-col gap-3">
                <PriceRow label="SOL / USD" value={`$${solPrice.toFixed(2)}`} icon="/sol-logo.png" />
                <PriceRow label="USDC / USD" value={`$${prices.usdc.toFixed(4)}`} icon="/usdc-logo.png" />
                <PriceRow label="USDT / USD" value={`$${prices.usdt.toFixed(4)}`} icon="/usdt-logo.png" />
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-gray-500" />
              </div>
            )}
          </div>

          {solValue > 0 && prices && (
            <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Conversion Summary</span>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Send</span>
                  <span className="text-white text-sm font-bold">{solValue.toFixed(6)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Receive</span>
                  <span className="text-white text-sm font-bold">{receiveAmount.toFixed(2)} {targetCurrency.toUpperCase()}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-gray-400 text-sm">Rate</span>
                  <span className="text-gray-300 text-xs">1 SOL = {rate.toFixed(2)} {targetCurrency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">USD Value</span>
                  <span className="text-green-400 text-sm font-bold">${(solValue * solPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111215] rounded-2xl p-6 border border-white/10 max-w-md w-full">
            <h3 className="text-white text-lg font-bold mb-2">Swap Coming Soon</h3>
            <p className="text-gray-400 text-sm mb-6">
              On-chain SOL to {targetCurrency.toUpperCase()} swaps are not yet available. This feature is under development. Your wallet balance remains unchanged.
            </p>
            <div className="bg-[#0A0B0E] rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">Would send</span>
                <span className="text-white text-sm font-bold">{solValue.toFixed(6)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Would receive</span>
                <span className="text-white text-sm font-bold">{receiveAmount.toFixed(2)} {targetCurrency.toUpperCase()}</span>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 rounded-xl font-bold text-sm transition-all duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={icon} alt="" className="w-5 h-5 rounded-full" />
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}
