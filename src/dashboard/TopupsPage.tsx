import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

const assets = [
  { symbol: 'USDT', name: 'Tether', logo: '/usdt.png', rate: 1.0 },
  { symbol: 'USDC', name: 'USD Coin', logo: '/usdc.png', rate: 1.0 },
];

export default function TopupsPage() {
  const [selectedAsset, setSelectedAsset] = useState(0);
  const [amount, setAmount] = useState('500.00');
  const [showDropdown, setShowDropdown] = useState(false);

  const asset = assets[selectedAsset];
  const numAmount = parseFloat(amount) || 0;
  const fee = 1.50;
  const received = Math.max(0, numAmount - fee);

  const handlePercentage = (pct: number) => {
    const balance = 1286.34;
    const val = pct === 100 ? balance : (balance * pct) / 100;
    setAmount(val.toFixed(2));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Top-up Balance</h1>
        <div className="text-gray-400 text-sm font-medium">
          Available: <span className="text-white font-bold">1,286.34 USDC</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-6">
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Select Asset</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between bg-[#0A0B0E] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={asset.logo} alt={asset.symbol} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-base font-bold">
                    {asset.symbol} <span className="text-gray-500 font-normal">{asset.name}</span>
                  </span>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1B1F] rounded-xl border border-white/10 overflow-hidden z-10 shadow-xl">
                  {assets.map((a, i) => (
                    <button
                      key={a.symbol}
                      onClick={() => { setSelectedAsset(i); setShowDropdown(false); }}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors ${
                        i === selectedAsset ? 'bg-[#FF6940]/10' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <img src={a.logo} alt={a.symbol} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-white text-sm font-bold">
                        {a.symbol} <span className="text-gray-500 font-normal">{a.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 block">Amount</label>
            <div className="flex items-center justify-between bg-[#0A0B0E] p-4 rounded-xl border border-white/5">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                className="bg-transparent text-white text-2xl sm:text-3xl font-bold outline-none w-full"
                placeholder="0.00"
              />
              <span className="text-gray-500 text-lg font-bold shrink-0 ml-3">{asset.symbol}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
              <span className="text-gray-500 text-sm">
                ≈ ${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
              <div className="flex gap-2">
                {[25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentage(pct)}
                    className="text-[#FF6940] text-xs bg-[#FF6940]/10 hover:bg-[#FF6940]/20 px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5 flex-1">
            <span className="text-white text-lg font-bold mb-5 block">Summary</span>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">You send</span>
                <span className="text-white text-sm font-bold">{numAmount.toFixed(2)} {asset.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Network Fee</span>
                <span className="text-white text-sm font-bold">{fee.toFixed(2)} {asset.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Rate</span>
                <span className="text-white text-sm font-bold">1 {asset.symbol} = $1 USD</span>
              </div>
              <div className="border-t border-white/5 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm font-bold">You receive</span>
                  <span className="text-[#FF6940] text-xl font-bold">
                    ${received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#FF6940] hover:bg-[#E55E39] text-black py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#FF6940]/20">
            Confirm Top-up <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
