import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Eye, EyeOff, Snowflake, Loader2 } from 'lucide-react';

interface Card {
  id: number;
  card_number: string;
  card_number_masked: string;
  card_number_formatted: string;
  cvv: string;
  expiry: string;
  name: string;
  frozen: boolean;
  online_payments: boolean;
  contactless: boolean;
  created_at: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [revealedCVVs, setRevealedCVVs] = useState<Set<number>>(new Set());

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
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

  const createCard = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchCards();
      }
    } catch (err) {
      console.error('Failed to create card:', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleFreeze = async (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const endpoint = card.frozen ? 'unfreeze' : 'freeze';
    try {
      const res = await fetch(`/api/cards/${cardId}/${endpoint}`, { method: 'PATCH' });
      if (res.ok) {
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, frozen: !c.frozen } : c));
      }
    } catch (err) {
      console.error('Failed to toggle freeze:', err);
    }
  };

  const toggleReveal = async (cardId: number) => {
    if (revealedCards.has(cardId)) {
      setRevealedCards(prev => { const n = new Set(prev); n.delete(cardId); return n; });
      setRevealedCVVs(prev => { const n = new Set(prev); n.delete(cardId); return n; });
      return;
    }
    try {
      const res = await fetch(`/api/cards/${cardId}/details`);
      if (res.ok) {
        const detail = await res.json();
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...detail, card_number_formatted: detail.card_number_formatted } : c));
        setRevealedCards(prev => new Set(prev).add(cardId));
        setRevealedCVVs(prev => new Set(prev).add(cardId));
      }
    } catch (err) {
      console.error('Failed to get card details:', err);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Cards</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#111215] border border-white/5 flex items-center justify-center mb-6">
            <CreditCard size={36} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No cards yet</h2>
          <p className="text-gray-400 text-sm text-center max-w-md mb-8">
            Create your first virtual Visa card to start making payments and managing your spending.
          </p>
          <button
            onClick={createCard}
            disabled={creating}
            className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-8 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6940]/20 disabled:opacity-50"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {creating ? 'Creating...' : 'Create Virtual Card'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Cards</h1>
        <button
          onClick={createCard}
          disabled={creating}
          className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-6 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {creating ? 'Creating...' : 'Add Card'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map(card => (
          <div key={card.id} className="flex flex-col gap-4">
            <div className={`relative rounded-2xl p-6 overflow-hidden min-h-[210px] flex flex-col justify-between ${card.frozen ? 'opacity-60' : ''}`}
              style={{
                background: card.frozen
                  ? 'linear-gradient(135deg, #3a3a4a 0%, #2a2a3a 100%)'
                  : 'linear-gradient(135deg, #FF6940 0%, #FF8F6B 30%, #FF6940 60%, #E55527 100%)',
              }}
            >
              {card.frozen && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-1.5">
                  <Snowflake size={14} className="text-white" />
                  <span className="text-white text-xs font-bold">FROZEN</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-medium">{card.name}</span>
                <span className="text-white font-bold text-lg tracking-wider">VISA</span>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-white text-lg sm:text-xl font-mono tracking-widest">
                    {revealedCards.has(card.id)
                      ? card.card_number_formatted
                      : card.card_number_masked}
                  </span>
                  <button
                    onClick={() => toggleReveal(card.id)}
                    className="text-white/70 hover:text-white transition-colors"
                    title={revealedCards.has(card.id) ? 'Hide details' : 'Show details'}
                  >
                    {revealedCards.has(card.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/60 text-[10px] uppercase tracking-wider block">Expires</span>
                    <span className="text-white text-sm font-mono">{card.expiry}</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-[10px] uppercase tracking-wider block">CVV</span>
                    <span className="text-white text-sm font-mono">
                      {revealedCVVs.has(card.id) ? card.cvv : '***'}
                    </span>
                  </div>
                  <div className="w-10 h-7 bg-white/20 rounded" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleFreeze(card.id)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border ${
                  card.frozen
                    ? 'bg-[#FF6940]/10 border-[#FF6940]/30 text-[#FF6940] hover:bg-[#FF6940]/20'
                    : 'bg-[#1A1B1F] border-white/5 text-white hover:bg-[#222326]'
                }`}
              >
                <Snowflake size={16} />
                {card.frozen ? 'Unfreeze' : 'Freeze'}
              </button>
              <button
                onClick={() => toggleReveal(card.id)}
                className="flex-1 bg-[#1A1B1F] border border-white/5 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-[#222326]"
              >
                {revealedCards.has(card.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                {revealedCards.has(card.id) ? 'Hide' : 'Reveal'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
