import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Bot, ArrowLeftRight, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/app/agents', icon: Bot, label: 'Agents', end: false },
  { to: '/app/transactions', icon: ArrowLeftRight, label: 'Transactions', end: false },
  { to: '/app/policies', icon: ShieldCheck, label: 'Policies', end: false },
];

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
    isActive ? 'bg-[#FF6940]/10 text-[#FF6940]' : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090C] font-sans flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.04] bg-[#08090C] shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-white/[0.04]">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/moltfin-logo.png" alt="Molt.Fin" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-bold tracking-tight text-white">Molt.Fin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-4 mb-2">Platform</span>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.04]">
          <Link to="/docs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            Documentation
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            Back to Home
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-[#08090C]/90 backdrop-blur-xl border-b border-white/[0.04] px-5 sm:px-6 py-4 flex items-center justify-between md:justify-end">
          <div className="flex items-center gap-2.5 md:hidden">
            <img src="/moltfin-logo.png" alt="Molt.Fin" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-base font-bold tracking-tight text-white">Molt.Fin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#FF6940]/8 border border-[#FF6940]/15 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[#FF6940] text-xs font-semibold">Live</span>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute top-0 left-0 w-72 h-full bg-[#0D0E12] border-r border-white/[0.04] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <img src="/moltfin-logo.png" alt="Molt.Fin" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-lg font-bold tracking-tight text-white">Molt.Fin</span>
                </Link>
                <button className="text-gray-400 hover:text-white p-1" onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-4 flex flex-col gap-1">
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-4 mb-2">Platform</span>
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => linkClass(isActive)}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-white/[0.04]">
                <Link to="/docs" className="block text-gray-400 hover:text-white text-sm font-medium py-2 px-4" onClick={() => setMobileOpen(false)}>Documentation</Link>
                <Link to="/" className="block text-gray-400 hover:text-white text-sm font-medium py-2 px-4" onClick={() => setMobileOpen(false)}>Back to Home</Link>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-5 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0E12]/95 backdrop-blur-xl border-t border-white/[0.04] md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    isActive ? 'text-[#FF6940]' : 'text-gray-500'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
