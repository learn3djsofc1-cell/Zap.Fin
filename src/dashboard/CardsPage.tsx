import { useState } from 'react';
import { Eye, Lock, Plus } from 'lucide-react';

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [freezeCard, setFreezeCard] = useState(false);

  const cards = [
    {
      type: 'Physical Metal',
      last4: '1919',
      name: 'John Doe',
      expiry: '12/28',
      style: 'metal',
      limit: { used: 5000, total: 10000 },
    },
    {
      type: 'Virtual',
      last4: '4242',
      name: 'Online Subs',
      expiry: '06/27',
      style: 'virtual',
      limit: { used: 2450, total: 5000 },
    },
  ];

  const active = cards[selectedCard];

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Cards</h1>
        <button className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-2.5 px-5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus size={16} />
          New Card
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => setSelectedCard(i)}
            className={`shrink-0 w-[280px] sm:w-[320px] rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 min-h-[180px] sm:min-h-[200px] ${
              card.style === 'metal'
                ? 'bg-gradient-to-br from-[#8a8a8a] via-[#6a6a6a] to-[#4a4a4a] border border-white/20'
                : 'bg-gradient-to-br from-[#FF6940] to-[#D95A36]'
            } ${selectedCard === i ? 'ring-2 ring-[#FF6940] ring-offset-2 ring-offset-[#0A0B0E] scale-[1.02]' : 'opacity-70 hover:opacity-90'}`}
          >
            {card.style === 'metal' && (
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 3px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 4px)' }} />
            )}
            {card.style === 'virtual' && (
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
            )}
            <div className="relative z-10 flex justify-between items-start">
              {card.style === 'metal' ? (
                <div className="w-10 h-7 rounded bg-gradient-to-br from-[#e6d5a7] to-[#b89f65] border border-[#967d46] opacity-90" />
              ) : (
                <div className="w-10 h-7 rounded bg-black/20" />
              )}
              <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider border ${
                card.style === 'metal'
                  ? 'bg-black/40 text-white border-white/10'
                  : 'bg-black/10 text-black border-black/10'
              }`}>
                {card.type}
              </span>
            </div>
            <div className="relative z-10 mt-auto">
              <div className={`text-sm font-mono mb-2 tracking-widest ${card.style === 'metal' ? 'text-white/80' : 'text-black/60'}`}>
                {showDetails || selectedCard !== i ? `•••• •••• •••• ${card.last4}` : '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end">
                <span className={`font-bold text-base ${card.style === 'metal' ? 'text-white' : 'text-black'}`}>{card.name}</span>
                <div className="text-right">
                  <span className={`text-xl font-extrabold italic leading-none ${card.style === 'metal' ? 'text-white' : 'text-black'}`}>VISA</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <span className="text-white text-lg font-bold mb-5 block">
            Card Settings ({active.type} •••• {active.last4})
          </span>
          <div className="flex flex-col gap-4">
            <div className="bg-[#1A1B1F] p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-gray-400" />
                <span className="text-white text-sm font-medium">Show Details</span>
              </div>
              <button
                role="switch"
                aria-checked={showDetails}
                aria-label="Show Details"
                onClick={() => setShowDetails(!showDetails)}
                className={`w-11 h-6 rounded-full relative transition-colors ${showDetails ? 'bg-[#FF6940]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all ${showDetails ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="bg-[#1A1B1F] p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <span className="text-white text-sm font-medium">Freeze Card</span>
              </div>
              <button
                role="switch"
                aria-checked={freezeCard}
                aria-label="Freeze Card"
                onClick={() => setFreezeCard(!freezeCard)}
                className={`w-11 h-6 rounded-full relative transition-colors ${freezeCard ? 'bg-[#FF6940]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${freezeCard ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`} />
              </button>
            </div>

            <div className="bg-[#1A1B1F] p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-medium">Monthly Limit</span>
                <span className="text-[#FF6940] text-sm font-bold">
                  ${active.limit.used.toLocaleString()} / ${active.limit.total.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0A0B0E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6940] rounded-full transition-all"
                  style={{ width: `${(active.limit.used / active.limit.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <span className="text-white text-lg font-bold mb-5 block">Card Details</span>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Card Type</span>
              <span className="text-white text-sm font-medium">{active.type}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Card Number</span>
              <span className="text-white text-sm font-mono">•••• {active.last4}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Expiry</span>
              <span className="text-white text-sm font-mono">{active.expiry}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${freezeCard ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-white text-sm font-medium">{freezeCard ? 'Frozen' : 'Active'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400 text-sm">Network</span>
              <span className="text-white text-sm font-bold italic">VISA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
