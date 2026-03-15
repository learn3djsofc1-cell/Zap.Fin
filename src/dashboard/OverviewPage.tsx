import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Send, MoreHorizontal } from 'lucide-react';

export default function OverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
        <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/5 font-mono sm:hidden">
          0x1234...5678
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <span className="text-gray-400 text-sm font-medium">Total Balance (USDC)</span>
          <div className="mt-3 mb-6">
            <span className="text-4xl sm:text-5xl font-bold text-white">$1,286</span>
            <span className="text-2xl sm:text-3xl text-gray-400">.34</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/app/topups')}
              className="flex-1 sm:flex-none bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-6 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft size={16} />
              Top Up
            </button>
            <button className="flex-1 sm:flex-none bg-[#1A1B1F] hover:bg-[#222326] text-white py-3 px-6 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-white/5">
              <Send size={16} />
              Send
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF6940] to-[#D95A36] rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[180px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-8 translate-y-8" />
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-7 rounded bg-black/20 flex items-center justify-center">
              <div className="w-6 h-4 rounded-sm bg-black/10" />
            </div>
            <span className="text-black font-bold text-sm italic">VISA</span>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="text-black/60 text-sm font-mono mb-2 tracking-widest">•••• •••• •••• 1919</div>
            <div className="flex justify-between items-end">
              <span className="text-black font-bold text-lg">Virtual Card</span>
              <span className="text-black/80 text-sm font-mono">12/28</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-white text-lg font-bold">Recent Activity</span>
            <button className="text-gray-500 hover:text-gray-300 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3 bg-[#0A0B0E] rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src="/netflix.png" alt="Netflix" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Netflix Subscription</div>
                  <div className="text-gray-500 text-xs">Today, 14:20</div>
                </div>
              </div>
              <span className="text-red-400 text-sm font-bold">-$15.99</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#0A0B0E] rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src="/usdc.png" alt="USDC" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">USDC Top-up</div>
                  <div className="text-gray-500 text-xs">Yesterday, 09:45</div>
                </div>
              </div>
              <span className="text-[#FF6940] text-sm font-bold">+$500.00</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#0A0B0E] rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src="/spotify.png" alt="Spotify" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Spotify Premium</div>
                  <div className="text-gray-500 text-xs">Yesterday, 19:19</div>
                </div>
              </div>
              <span className="text-red-400 text-sm font-bold">-$14.87</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#0A0B0E] rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src="/airbnb.png" alt="Airbnb" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Airbnb Booking</div>
                  <div className="text-gray-500 text-xs">Mar 12, 16:30</div>
                </div>
              </div>
              <span className="text-red-400 text-sm font-bold">-$245.00</span>
            </div>
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
              <button className="bg-[#1A1B1F] hover:bg-[#222326] p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/5">
                <ArrowUpRight size={20} className="text-[#FF6940]" />
                <span className="text-white text-xs font-medium">Send</span>
              </button>
              <button
                onClick={() => navigate('/app/cards')}
                className="bg-[#1A1B1F] hover:bg-[#222326] p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6940" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span className="text-white text-xs font-medium">Cards</span>
              </button>
              <button
                onClick={() => navigate('/app/controls')}
                className="bg-[#1A1B1F] hover:bg-[#222326] p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6940" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span className="text-white text-xs font-medium">Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-[#111215] rounded-2xl p-5 sm:p-6 border border-white/5">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">Monthly Spending</span>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-white">$2,450</span>
              <span className="text-gray-500 text-sm mb-0.5">/ $5,000</span>
            </div>
            <div className="w-full h-2.5 bg-[#1A1B1F] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6940] rounded-full" style={{ width: '49%' }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 text-xs">49% used</span>
              <span className="text-gray-500 text-xs">$2,550 left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
