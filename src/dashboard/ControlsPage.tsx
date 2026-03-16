import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Plus, Loader2, Snowflake, Wifi, Radio, CheckCircle2, XCircle } from 'lucide-react';

interface Card {
  id: number;
  card_number_masked: string;
  expiry: string;
  name: string;
  frozen: boolean;
  online_payments: boolean;
  contactless: boolean;
}

export default function ControlsPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        setCards(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const toggleField = async (cardId: number, field: string) => {
    const key = `${cardId}-${field}`;
    setToggling(key);
    try {
      const res = await fetch(`/api/cards/${cardId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updated } : c));
      }
    } catch (err) {
      console.error('Failed to toggle:', err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#FF5550]" size={32} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-6xl mx-auto pb-20 md:pb-0">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Card Security</h1>
          <p className="text-gray-500 text-sm mt-1">Manage card permissions and spending controls</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5550]/20 to-[#FF5550]/5 flex items-center justify-center mb-6">
            <Shield size={36} className="text-[#FF5550]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No cards to configure</h2>
          <p className="text-gray-400 text-sm text-center max-w-md mb-8">
            Issue a virtual card first — then return here to manage freeze controls, online payment permissions, and contactless settings.
          </p>
          <button onClick={() => navigate('/app/cards')}
            className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 px-8 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#FF5550]/20">
            <Plus size={18} /> Issue a Card
          </button>
        </div>
      </div>
    );
  }

  const totalActive = cards.filter(c => !c.frozen).length;
  const totalFrozen = cards.filter(c => c.frozen).length;
  const totalOnline = cards.filter(c => c.online_payments).length;
  const totalContactless = cards.filter(c => c.contactless).length;

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Card Security</h1>
          <p className="text-gray-500 text-sm mt-1">Toggle permissions for each of your cards</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Active" value={`${totalActive}`} color="green" />
        <MiniStat label="Frozen" value={`${totalFrozen}`} color={totalFrozen > 0 ? 'red' : 'gray'} />
        <MiniStat label="Online" value={`${totalOnline}/${cards.length}`} color="blue" />
        <MiniStat label="Contactless" value={`${totalContactless}/${cards.length}`} color="purple" />
      </div>

      <div className="flex flex-col gap-5">
        {cards.map(card => (
          <div key={card.id} className="bg-[#111215] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.frozen ? 'bg-red-500/10' : 'bg-[#FF5550]/10'}`}>
                <CreditCard size={18} className={card.frozen ? 'text-red-400' : 'text-[#FF5550]'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">{card.name}</span>
                  {card.frozen && <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Frozen</span>}
                </div>
                <span className="text-gray-500 text-xs">{card.card_number_masked} &middot; Exp {card.expiry}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {card.frozen ? <XCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-green-400" />}
                <span className={`text-xs font-medium ${card.frozen ? 'text-red-400' : 'text-green-400'}`}>{card.frozen ? 'Blocked' : 'Active'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <ControlToggle
                icon={<Snowflake size={16} />}
                label="Freeze Card"
                description="Block all transactions"
                enabled={card.frozen}
                loading={toggling === `${card.id}-frozen`}
                onToggle={() => toggleField(card.id, 'frozen')}
                destructive
              />
              <ControlToggle
                icon={<Wifi size={16} />}
                label="Online Payments"
                description="Web & app purchases"
                enabled={card.online_payments}
                loading={toggling === `${card.id}-online_payments`}
                onToggle={() => toggleField(card.id, 'online_payments')}
              />
              <ControlToggle
                icon={<Radio size={16} />}
                label="Contactless"
                description="Tap-to-pay terminals"
                enabled={card.contactless}
                loading={toggling === `${card.id}-contactless`}
                onToggle={() => toggleField(card.id, 'contactless')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    gray: 'text-gray-500',
  };
  return (
    <div className="bg-[#111215] rounded-xl p-3.5 border border-white/5">
      <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-1">{label}</span>
      <span className={`text-lg font-bold ${colors[color] || 'text-white'}`}>{value}</span>
    </div>
  );
}

function ControlToggle({
  icon, label, description, enabled, loading, onToggle, destructive = false,
}: {
  icon: React.ReactNode; label: string; description: string; enabled: boolean; loading: boolean; onToggle: () => void; destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          destructive
            ? (enabled ? 'bg-red-500/10 text-red-400' : 'bg-[#1A1B1F] text-gray-500')
            : (enabled ? 'bg-[#FF5550]/10 text-[#FF5550]' : 'bg-[#1A1B1F] text-gray-500')
        }`}>{icon}</div>
        <div>
          <span className="text-white text-xs font-semibold block">{label}</span>
          <span className="text-gray-600 text-[10px]">{description}</span>
        </div>
      </div>
      <button onClick={onToggle} disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          enabled ? (destructive ? 'bg-red-500' : 'bg-[#FF5550]') : 'bg-[#2A2B2F]'
        } ${loading ? 'opacity-50' : ''}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
