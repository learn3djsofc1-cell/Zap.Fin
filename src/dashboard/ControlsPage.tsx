import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Plus, Loader2, Snowflake, Wifi, Radio } from 'lucide-react';

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
        <Loader2 className="animate-spin text-[#FF6940]" size={32} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-6xl mx-auto pb-20 md:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Card Controls</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#111215] border border-white/5 flex items-center justify-center mb-6">
            <Shield size={36} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No cards to manage</h2>
          <p className="text-gray-400 text-sm text-center max-w-md mb-8">
            Create a virtual card first to access security controls, spending limits, and card settings.
          </p>
          <button
            onClick={() => navigate('/app/cards')}
            className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-8 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6940]/20"
          >
            <Plus size={18} />
            Create a Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Card Controls</h1>
      </div>

      <div className="flex flex-col gap-6">
        {cards.map(card => (
          <div key={card.id} className="bg-[#111215] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF6940]/10 flex items-center justify-center">
                <CreditCard size={20} className="text-[#FF6940]" />
              </div>
              <div>
                <span className="text-white font-bold block">{card.name}</span>
                <span className="text-gray-400 text-sm">{card.card_number_masked} &middot; {card.expiry}</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              <ToggleRow
                icon={<Snowflake size={18} />}
                label="Freeze Card"
                description="Temporarily disable all transactions"
                enabled={card.frozen}
                loading={toggling === `${card.id}-frozen`}
                onToggle={() => toggleField(card.id, 'frozen')}
                destructive
              />
              <ToggleRow
                icon={<Wifi size={18} />}
                label="Online Payments"
                description="Allow payments on websites and apps"
                enabled={card.online_payments}
                loading={toggling === `${card.id}-online_payments`}
                onToggle={() => toggleField(card.id, 'online_payments')}
              />
              <ToggleRow
                icon={<Radio size={18} />}
                label="Contactless"
                description="Allow tap-to-pay at terminals"
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

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  loading,
  onToggle,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          destructive
            ? (enabled ? 'bg-red-500/10 text-red-400' : 'bg-[#1A1B1F] text-gray-400')
            : (enabled ? 'bg-[#FF6940]/10 text-[#FF6940]' : 'bg-[#1A1B1F] text-gray-400')
        }`}>
          {icon}
        </div>
        <div>
          <span className="text-white text-sm font-medium block">{label}</span>
          <span className="text-gray-500 text-xs">{description}</span>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          enabled
            ? (destructive ? 'bg-red-500' : 'bg-[#FF6940]')
            : 'bg-[#2A2B2F]'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
