import { useState } from 'react';

export default function ControlsPage() {
  const [freezeCard, setFreezeCard] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [contactless, setContactless] = useState(true);

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Card Controls</h1>
        <div className="bg-[#111215] px-4 py-2 rounded-xl text-sm text-white border border-white/5 flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${freezeCard ? 'bg-red-500' : 'bg-[#FF6940]'}`} />
          <span className="font-medium">{freezeCard ? 'Frozen' : 'Active'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-[#FF6940] rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[200px]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, black 2px, black 4px)' }} />
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-10 h-7 rounded bg-black/20 flex items-center justify-center">
                <div className="w-6 h-4 rounded-sm bg-black/10" />
              </div>
              <span className="text-black font-bold text-sm italic">VISA</span>
            </div>
            <div className="relative z-10 mt-auto">
              <div className="text-black/80 text-sm font-mono mb-2 tracking-widest">•••• 1919</div>
            </div>
          </div>

          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-5 block">Security</span>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Freeze Card</span>
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
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Online Payments</span>
                <button
                  role="switch"
                  aria-checked={onlinePayments}
                  aria-label="Online Payments"
                  onClick={() => setOnlinePayments(!onlinePayments)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${onlinePayments ? 'bg-[#FF6940]' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${onlinePayments ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Contactless</span>
                <button
                  role="switch"
                  aria-checked={contactless}
                  aria-label="Contactless"
                  onClick={() => setContactless(!contactless)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${contactless ? 'bg-[#FF6940]' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${contactless ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Monthly Limit</span>
              <span className="text-[#FF6940] text-sm font-bold">$2,450 / $5,000</span>
            </div>
            <div className="w-full h-3 bg-[#1A1B1F] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6940] rounded-full" style={{ width: '49%' }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 text-xs">49% used</span>
              <span className="text-gray-500 text-xs">$2,550 remaining</span>
            </div>
          </div>

          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5 flex-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-5 block">Recent Transactions</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-[#0A0B0E] p-3 sm:p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src="/spotify.png" alt="Spotify" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Spotify Premium</p>
                    <p className="text-gray-500 text-xs">Today, 19:19</p>
                  </div>
                </div>
                <span className="text-red-400 text-sm font-bold">-14.87 USDC</span>
              </div>

              <div className="flex items-center justify-between bg-[#0A0B0E] p-3 sm:p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src="/netflix.png" alt="Netflix" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Netflix Subscription</p>
                    <p className="text-gray-500 text-xs">Yesterday, 14:20</p>
                  </div>
                </div>
                <span className="text-red-400 text-sm font-bold">-15.99 USDC</span>
              </div>

              <div className="flex items-center justify-between bg-[#0A0B0E] p-3 sm:p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src="/airbnb.png" alt="Airbnb" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Airbnb Booking</p>
                    <p className="text-gray-500 text-xs">Mar 12, 16:30</p>
                  </div>
                </div>
                <span className="text-red-400 text-sm font-bold">-245.00 USDC</span>
              </div>

              <div className="flex items-center justify-between bg-[#0A0B0E] p-3 sm:p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src="/usdc.png" alt="USDC" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">USDC Top-up</p>
                    <p className="text-gray-500 text-xs">Mar 11, 09:45</p>
                  </div>
                </div>
                <span className="text-[#FF6940] text-sm font-bold">+500.00 USDC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
