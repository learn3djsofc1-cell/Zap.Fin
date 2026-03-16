import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, CreditCard, Wallet, Plus, Loader2, TrendingUp, Shield, ArrowRight, BarChart3, Activity } from 'lucide-react';

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
        <Loader2 className="animate-spin text-[#FF5550]" size={32} />
      </div>
    );
  }

  const firstCard = cards[0];
  const solBalance = balance?.sol ?? 0;
  const solPrice = prices?.sol ?? 0;
  const usdBalance = solBalance * solPrice;

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your portfolio at a glance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/app/topups')} className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#FF5550]/15">
            <ArrowDownLeft size={14} /> Fund
          </button>
          <button onClick={() => navigate('/app/cards')} className="bg-[#111215] hover:bg-[#1A1B1F] text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border border-white/5">
            <CreditCard size={14} /> Cards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Portfolio" value={`$${Math.floor(usdBalance).toLocaleString()}`} sub={wallet?.confirmed ? `${solBalance.toFixed(4)} SOL` : 'No wallet'} icon={<BarChart3 size={16} />} accent />
        <StatCard label="SOL Price" value={solPrice > 0 ? `$${solPrice.toFixed(2)}` : '-'} sub={solPrice > 0 ? 'Live' : 'Unavailable'} icon={<TrendingUp size={16} />} live={solPrice > 0} />
        <StatCard label="Cards" value={`${cards.length}`} sub={`${cards.filter(c => !c.frozen).length} active`} icon={<CreditCard size={16} />} />
        <StatCard label="Security" value={cards.length > 0 ? 'Active' : 'Setup'} sub={cards.length > 0 ? `${cards.filter(c => c.frozen).length} frozen` : 'Issue a card'} icon={<Shield size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 mb-5">
        <div className="lg:col-span-3 bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#FF5550]" />
              <span className="text-white font-bold text-sm">Activity</span>
            </div>
            <span className="text-gray-600 text-xs">Last 30 days</span>
          </div>

          <div className="flex items-end gap-[3px] h-28 mb-4">
            {[20, 35, 28, 45, 40, 55, 50, 65, 48, 70, 60, 80, 55, 75, 68, 85, 72, 90, 78, 95, 82, 88, 76, 92].map((h, i) => (
              <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${h}%`, background: i >= 20 ? '#FF5550' : i >= 16 ? 'rgba(255,85,80,0.5)' : 'rgba(255,85,80,0.12)' }} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div><span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">Total Volume</span><span className="text-white font-bold text-sm">${usdBalance.toFixed(2)}</span></div>
            <div className="text-right"><span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">Transactions</span><span className="text-white font-bold text-sm">0</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
          {firstCard ? (
            <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[170px] cursor-pointer transition-transform duration-200 hover:scale-[1.02] relative overflow-hidden"
              onClick={() => navigate('/app/cards')}
              style={{
                background: firstCard.frozen
                  ? 'linear-gradient(145deg, #2a2a3a 0%, #1a1a2a 100%)'
                  : 'linear-gradient(145deg, #FF5550 0%, #FF6B67 40%, #c43c38 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-x-10 -translate-y-10" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-5 rounded bg-white/20" />
                  <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">{firstCard.name}</span>
                </div>
                <span className="text-white font-bold text-sm italic tracking-wider">VISA</span>
              </div>
              <div className="mt-auto relative z-10">
                <span className="text-white/60 text-[10px] font-mono tracking-[3px] block mb-1">{firstCard.card_number_masked}</span>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px]">Exp {firstCard.expiry}</span>
                  {cards.length > 1 && <span className="text-white/40 text-[10px]">+{cards.length - 1} more</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111215] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center min-h-[170px]">
              <CreditCard size={28} className="text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm text-center mb-3">No cards yet</p>
              <button onClick={() => navigate('/app/cards')} className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
                <Plus size={14} /> Issue Card
              </button>
            </div>
          )}

          <div className="bg-[#111215] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-[#FF5550]" />
              <span className="text-white font-bold text-sm">Wallet</span>
            </div>
            {wallet?.confirmed ? (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-white font-bold text-lg">{solBalance.toFixed(4)} <span className="text-gray-400 text-xs font-normal">SOL</span></span>
                  {solPrice > 0 && <span className="text-gray-500 text-xs">${usdBalance.toFixed(2)}</span>}
                </div>
                <code className="text-[#FF5550] text-[10px] break-all font-mono bg-[#0A0B0E] rounded-lg p-2.5 block">{wallet.address}</code>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-500 text-xs mb-2">No wallet connected</p>
                <button onClick={() => navigate('/app/topups')} className="text-[#FF5550] text-xs font-bold hover:underline">Set up wallet →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <ArrowDownLeft size={16} className="text-[#FF5550]" />, label: 'Fund Wallet', desc: 'Deposit SOL to your wallet', path: '/app/topups' },
          { icon: <CreditCard size={16} className="text-[#FF5550]" />, label: 'Issue Card', desc: 'Create a new virtual card', path: '/app/cards' },
          { icon: <Shield size={16} className="text-[#FF5550]" />, label: 'Card Security', desc: 'Manage card permissions', path: '/app/controls' },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.path)} className="bg-[#111215] hover:bg-[#161719] p-4 rounded-xl flex items-center gap-3 transition-all border border-white/5 group text-left">
            <div className="w-9 h-9 rounded-lg bg-[#FF5550]/10 flex items-center justify-center shrink-0">{action.icon}</div>
            <div className="min-w-0 flex-1">
              <span className="text-white text-sm font-semibold block">{action.label}</span>
              <span className="text-gray-500 text-xs">{action.desc}</span>
            </div>
            <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent, live }: { label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean; live?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? 'bg-[#FF5550] border-[#FF5550]' : 'bg-[#111215] border-white/5'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${accent ? 'text-white/70' : 'text-gray-500'}`}>{label}</span>
        <div className={accent ? 'text-white/60' : 'text-gray-600'}>{icon}</div>
      </div>
      <span className={`text-xl font-bold block ${accent ? 'text-white' : 'text-white'}`}>{value}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {live && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
        <span className={`text-xs ${accent ? 'text-white/60' : 'text-gray-500'}`}>{sub}</span>
      </div>
    </div>
  );
}
