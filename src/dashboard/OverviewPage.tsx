import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, CreditCard, Wallet, Plus, Loader2 } from 'lucide-react';

interface Card {
  id: number;
  card_number_masked: string;
  expiry: string;
  name: string;
  frozen: boolean;
}

interface WalletData {
  id: number;
  address: string;
  confirmed: boolean;
}

interface Balance {
  sol: number;
}

interface Prices {
  sol: number;
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cardsRes, walletRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/wallet'),
      ]);
      if (cardsRes.ok) setCards(await cardsRes.json());
      if (walletRes.ok) {
        const w = await walletRes.json();
        setWallet(w);
        if (w?.confirmed) {
          const [balRes, priceRes] = await Promise.all([
            fetch('/api/wallet/balance'),
            fetch('/api/prices/sol'),
          ]);
          if (balRes.ok) setBalance(await balRes.json());
          if (priceRes.ok) setPrices(await priceRes.json());
        }
      }
    } catch (err) {
      console.error('Failed to fetch overview data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#FF6940]" size={32} />
      </div>
    );
  }

  const firstCard = cards[0];
  const solBalance = balance?.sol ?? 0;
  const solPrice = prices?.sol ?? 0;
  const usdBalance = solBalance * solPrice;

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <span className="text-gray-400 text-sm font-medium">Total Balance</span>
          <div className="mt-3 mb-1">
            <span className="text-4xl sm:text-5xl font-bold text-white">
              ${Math.floor(usdBalance).toLocaleString()}
            </span>
            <span className="text-2xl sm:text-3xl text-gray-400">
              .{(usdBalance % 1).toFixed(2).slice(2)}
            </span>
          </div>
          {wallet?.confirmed && (
            <span className="text-gray-500 text-sm block mb-4">
              {solBalance.toFixed(4)} SOL {solPrice > 0 && `@ $${solPrice.toFixed(2)}`}
            </span>
          )}
          {!wallet?.confirmed && <div className="mb-4" />}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/app/topups')}
              className="flex-1 sm:flex-none bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-6 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft size={16} />
              Top Up
            </button>
          </div>
        </div>

        {firstCard ? (
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[180px] cursor-pointer"
            onClick={() => navigate('/app/cards')}
            style={{
              background: firstCard.frozen
                ? 'linear-gradient(135deg, #3a3a4a 0%, #2a2a3a 100%)'
                : 'linear-gradient(135deg, #FF6940 0%, #FF8F6B 30%, #FF6940 60%, #E55527 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-xs font-medium">{firstCard.name}</span>
              <span className="text-white font-bold text-sm tracking-wider">VISA</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white text-sm font-mono tracking-widest">
                  {firstCard.card_number_masked}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{firstCard.expiry}</span>
                {cards.length > 1 && (
                  <span className="text-white/50 text-xs">+{cards.length - 1} more</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5 flex flex-col items-center justify-center min-h-[180px]">
            <CreditCard size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm text-center mb-4">No cards yet</p>
            <button
              onClick={() => navigate('/app/cards')}
              className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-2.5 px-5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Create Visa Card
            </button>
          </div>
        )}
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-[#111215] rounded-2xl p-5 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Cards</span>
            <span className="text-2xl font-bold text-white">{cards.length}</span>
            <span className="text-gray-500 text-xs ml-1">active</span>
          </div>
          <div className="bg-[#111215] rounded-2xl p-5 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">SOL Balance</span>
            <span className="text-2xl font-bold text-white">{solBalance.toFixed(2)}</span>
            <span className="text-gray-500 text-xs ml-1">SOL</span>
          </div>
          <div className="bg-[#111215] rounded-2xl p-5 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">USD Value</span>
            <span className="text-2xl font-bold text-white">${usdBalance.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <span className="text-white text-lg font-bold mb-5 block">Recent Activity</span>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-[#1A1B1F] flex items-center justify-center mb-3">
              <Wallet size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">No activity yet</p>
            <p className="text-gray-600 text-xs mt-1">Your transactions will appear here</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Quick Actions</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/app/topups')}
                className="bg-[#1A1B1F] hover:bg-[#222326] p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/5"
              >
                <ArrowDownLeft size={20} className="text-[#FF6940]" />
                <span className="text-white text-xs font-medium">Top Up</span>
              </button>
              <button
                onClick={() => navigate('/app/cards')}
                className="bg-[#1A1B1F] hover:bg-[#222326] p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/5"
              >
                <CreditCard size={20} className="text-[#FF6940]" />
                <span className="text-white text-xs font-medium">Cards</span>
              </button>
            </div>
          </div>

          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Wallet</span>
            {wallet?.confirmed ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-white font-bold text-lg">{solBalance.toFixed(4)} SOL</span>
                  {solPrice > 0 && (
                    <span className="text-gray-400 text-xs">${usdBalance.toFixed(2)}</span>
                  )}
                </div>
                <code className="text-[#FF6940] text-xs break-all font-mono bg-[#0A0B0E] rounded-lg p-3">
                  {wallet.address}
                </code>
                <button
                  onClick={() => navigate('/app/topups')}
                  className="text-[#FF6940] text-xs font-bold mt-1 hover:underline"
                >
                  Go to Top-ups
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <Wallet size={24} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">No wallet created</p>
                <button
                  onClick={() => navigate('/app/topups')}
                  className="text-[#FF6940] text-xs font-bold mt-2 hover:underline"
                >
                  Create Solana Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
