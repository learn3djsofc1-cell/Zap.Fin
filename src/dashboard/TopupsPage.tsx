import { useState, useEffect, useCallback } from 'react';
import { Wallet, Copy, Check, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';

interface WalletData {
  id: number;
  address: string;
  confirmed: boolean;
  created_at: string;
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

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

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
      if (type === 'key') {
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
      } else {
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (type === 'key') {
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
      } else {
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#FF6940]" size={32} />
      </div>
    );
  }

  if (showKeyFlow) {
    return (
      <div className="max-w-2xl mx-auto pb-20 md:pb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Wallet Created</h1>

        <div className="bg-[#111215] rounded-2xl p-6 border border-white/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-[#FF6940]" />
            <span className="text-white font-bold">Wallet Address</span>
          </div>
          <div className="bg-[#0A0B0E] rounded-xl p-4 flex items-center justify-between gap-3">
            <code className="text-green-400 text-sm break-all flex-1 font-mono">{walletAddress}</code>
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
              className="mt-0.5 w-5 h-5 rounded border-white/20 bg-[#1A1B1F] text-[#FF6940] focus:ring-[#FF6940] focus:ring-offset-0 accent-[#FF6940]"
            />
            <span className="text-white text-sm font-medium">
              I have securely saved my private key and understand it will not be shown again
            </span>
          </label>
        </div>

        <button
          onClick={confirmWallet}
          disabled={!confirmed || confirming}
          className="w-full bg-[#FF6940] hover:bg-[#E55E39] text-black py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF6940]/20"
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
            className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-8 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6940]/20 disabled:opacity-50"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
            {creating ? 'Creating...' : 'Create Solana Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Top-up Balance</h1>
      </div>

      <div className="bg-[#111215] rounded-2xl p-6 border border-white/5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-[#FF6940]" />
          <span className="text-white font-bold">Solana Wallet</span>
        </div>
        <div className="bg-[#0A0B0E] rounded-xl p-4 flex items-center justify-between gap-3 mb-3">
          <code className="text-green-400 text-sm break-all flex-1 font-mono">{wallet.address}</code>
          <button
            onClick={() => copyToClipboard(wallet.address, 'address')}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            {addressCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
        </div>
        <a
          href={`https://explorer.solana.com/address/${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF6940] text-xs font-medium hover:underline flex items-center gap-1"
        >
          View on Solana Explorer <ExternalLink size={12} />
        </a>
      </div>

      <div className="bg-[#111215] rounded-2xl p-6 border border-white/5">
        <span className="text-white font-bold block mb-4">Top-up Conversion</span>
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-400 text-sm text-center">
            Real-time SOL to USD conversion coming soon. Send SOL to your wallet address above to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
