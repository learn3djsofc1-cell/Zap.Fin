import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ArrowUpCircle, Shield, Menu, X, ChevronLeft } from 'lucide-react';

const ZapLogo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="Zap.Fin" className={`${className || ''} rounded-lg`} />
);

const navItems = [
  { label: 'Dashboard', path: '/app', icon: LayoutDashboard, end: true },
  { label: 'Cards', path: '/app/cards', icon: CreditCard, end: false },
  { label: 'Top-ups', path: '/app/topups', icon: ArrowUpCircle, end: false },
  { label: 'Controls', path: '/app/controls', icon: Shield, end: false },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col md:flex-row">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111215] border-r border-white/5 flex flex-col shrink-0
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <ZapLogo className="w-8 h-8" />
            <span className="text-white font-bold text-lg tracking-tight">Zap.Fin</span>
          </button>
          <button className="md:hidden text-gray-400 p-1" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#FF6940] bg-[#FF6940]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? 'bg-[#FF6940]' : 'bg-gray-600'}`}>
                    <div className="w-2 h-2 bg-black rounded-sm" />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors w-full px-3 py-2"
          >
            <ChevronLeft size={14} />
            Back to Website
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0A0B0E]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-400 hover:text-white p-1.5 -ml-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <button onClick={() => navigate('/')} className="md:hidden flex items-center gap-2">
              <ZapLogo className="w-6 h-6" />
              <span className="text-white font-bold text-sm">Zap.Fin</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/5 font-mono">
              0x1234...5678
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6940] to-[#D95A36] flex items-center justify-center">
              <span className="text-black text-xs font-bold">JD</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111215] border-t border-white/5 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#FF6940]' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-[#FF6940]' : 'text-gray-500'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
