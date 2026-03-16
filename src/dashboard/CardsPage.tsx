import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Eye, EyeOff, Snowflake, Loader2, AlertCircle, Copy, Check } from 'lucide-react';

interface Card {
  id: number;
  card_number_masked: string;
  card_number_formatted?: string;
  cvv?: string;
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
  const [cardError, setCardError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const MAX_CARDS = 2;

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
    setCardError(null);
    if (cards.length >= MAX_CARDS) {
      setCardError(`You've reached the limit of ${MAX_CARDS} cards. Remove an existing card before issuing a new one.`);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchCards();
      } else {
        const data = await res.json();
        setCardError(data.error || 'Failed to issue card');
      }
    } catch (err) {
      console.error('Failed to create card:', err);
      setCardError('Something went wrong. Please try again.');
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
        setCards(prev => prev.map(c => c.id === cardId ? {
          ...c,
          card_number_formatted: detail.card_number_formatted,
          cvv: detail.cvv,
        } : c));
        setRevealedCards(prev => new Set(prev).add(cardId));
        setRevealedCVVs(prev => new Set(prev).add(cardId));
      }
    } catch (err) {
      console.error('Failed to get card details:', err);
    }
  };

  const copyCardNumber = async (card: Card) => {
    const num = card.card_number_formatted || card.card_number_masked;
    try { await navigator.clipboard.writeText(num.replace(/\s/g, '')); } catch { /* fallback */ }
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Card Vault</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your virtual Visa cards</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5550]/20 to-[#FF5550]/5 flex items-center justify-center mb-6">
            <CreditCard size={36} className="text-[#FF5550]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Issue your first card</h2>
          <p className="text-gray-400 text-sm text-center max-w-md mb-8">
            Create a virtual Visa card to start spending crypto at millions of merchants worldwide. Each card comes with its own security controls.
          </p>
          <button
            onClick={createCard}
            disabled={creating}
            className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 px-8 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#FF5550]/20 disabled:opacity-50"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {creating ? 'Issuing...' : 'Issue Virtual Card'}
          </button>
        </div>
      </div>
    );
  }

  const gradients = [
    'linear-gradient(145deg, #FF5550 0%, #FF6B67 40%, #c43c38 100%)',
    'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Card Vault</h1>
          <span className="text-gray-500 text-xs mt-1 block">{cards.length} of {MAX_CARDS} cards issued</span>
        </div>
        {cards.length < MAX_CARDS && (
          <button
            onClick={createCard}
            disabled={creating}
            className="bg-[#FF5550] hover:bg-[#E84B47] text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {creating ? 'Issuing...' : 'Issue Card'}
          </button>
        )}
      </div>
      {cardError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span className="text-red-400 text-sm">{cardError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {cards.map((card, idx) => (
          <div key={card.id} className="bg-[#111215] rounded-2xl border border-white/5 overflow-hidden">
            <div className={`relative p-5 sm:p-6 min-h-[200px] flex flex-col justify-between ${card.frozen ? 'opacity-70 grayscale' : ''}`}
              style={{
                background: card.frozen ? 'linear-gradient(145deg, #2a2a3a 0%, #1a1a2a 100%)' : gradients[idx % gradients.length],
              }}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl translate-x-14 -translate-y-14" />

              {card.frozen && (
                <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5 z-10">
                  <Snowflake size={12} className="text-white" />
                  <span className="text-white text-[10px] font-bold">FROZEN</span>
                </div>
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded bg-gradient-to-br from-[#e6d5a7] to-[#b89f65] border border-[#967d46]" />
                  <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">{card.name}</span>
                </div>
                <span className="text-white font-bold text-base italic tracking-widest">VISA</span>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-base sm:text-lg font-mono tracking-[3px]">
                    {revealedCards.has(card.id) ? card.card_number_formatted : card.card_number_masked}
                  </span>
                  {revealedCards.has(card.id) && (
                    <button onClick={() => copyCardNumber(card)} className="text-white/60 hover:text-white transition-colors">
                      {copiedId === card.id ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block">Exp</span>
                    <span className="text-white text-sm font-mono">{card.expiry}</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[9px] uppercase tracking-wider block">CVV</span>
                    <span className="text-white text-sm font-mono">{revealedCVVs.has(card.id) ? card.cvv : '•••'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 flex gap-2">
              <button
                onClick={() => toggleReveal(card.id)}
                className="flex-1 bg-[#0A0B0E] hover:bg-[#161719] text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                {revealedCards.has(card.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealedCards.has(card.id) ? 'Hide' : 'Reveal'}
              </button>
              <button
                onClick={() => toggleFreeze(card.id)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                  card.frozen
                    ? 'bg-[#FF5550]/10 border-[#FF5550]/30 text-[#FF5550] hover:bg-[#FF5550]/20'
                    : 'bg-[#0A0B0E] border-white/5 text-white hover:bg-[#161719]'
                }`}
              >
                <Snowflake size={14} />
                {card.frozen ? 'Unfreeze' : 'Freeze'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
