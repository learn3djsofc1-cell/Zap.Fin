import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shuffle, MessageSquare, ArrowLeftRight, Wifi, Settings, Menu, X, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true, group: 'Products' },
  { to: '/app/mixer', icon: Shuffle, label: 'Mixer', end: false, group: 'Products' },
  { to: '/app/messenger', icon: MessageSquare, label: 'Messenger', end: false, group: 'Products' },
  { to: '/app/bridge', icon: ArrowLeftRight, label: 'Bridge', end: false, group: 'Products' },
  { to: '/app/privacy', icon: Shield, label: 'Privacy Shield', end: false, group: 'Products' },
  { to: '/app/vpn', icon: Wifi, label: 'VPN', end: false, group: 'Products' },
  { to: '/app/settings', icon: Settings, label: 'Settings', end: false, group: 'Account' },
];

const mobileNavItems = navItems.filter(item => item.group === 'Products');

function UserAvatar({ name }: { name: string }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="w-8 h-8 rounded-lg bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
      <span className="text-[#0AF5D6] text-[10px] font-bold">{initials}</span>
    </div>
  );
}

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
    isActive
      ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/15'
      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
  }`;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#000000] font-sans flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.04] bg-[#000000] shrink-0 sticky top-0 h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0AF5D6]/[0.03] via-transparent to-[#0AF5D6]/[0.02] pointer-events-none" />
        <div className="p-5 border-b border-white/[0.04] relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/ghostlane-logo.png" alt="GhostLane" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-bold tracking-tight text-white">GhostLane</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto relative z-10">
          {(['Products', 'Account'] as const).map((group) => (
            <div key={group}>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-4 mb-2 mt-4 first:mt-2 block">{group}</span>
              {navItems.filter((item) => item.group === group).map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.04] relative z-10">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.02]">
              <UserAvatar name={user.name} />
              <div className="min-w-0 flex-1">
                <span className="text-white text-sm font-medium block truncate">{user.name}</span>
                <span className="text-gray-500 text-[10px] block truncate">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl border-b border-white/[0.04] px-5 sm:px-6 py-4 flex items-center justify-between md:justify-end">
          <div className="flex items-center gap-2.5 md:hidden">
            <img src="/ghostlane-logo.png" alt="GhostLane" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-base font-bold tracking-tight text-white">GhostLane</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#0AF5D6]/8 border border-[#0AF5D6]/15 rounded-lg px-3 py-1.5">
              <Shield size={12} className="text-[#0AF5D6]" />
              <span className="text-[#0AF5D6] text-xs font-semibold">Protected</span>
            </div>
            {user && (
              <div className="hidden md:block">
                <UserAvatar name={user.name} />
              </div>
            )}
            <button className="md:hidden text-gray-400 hover:text-white p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -288 }}
                animate={{ x: 0 }}
                exit={{ x: -288 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute top-0 left-0 w-72 h-full bg-[#0A0A0A] border-r border-white/[0.04] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                    <img src="/ghostlane-logo.png" alt="GhostLane" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-lg font-bold tracking-tight text-white">GhostLane</span>
                  </Link>
                  <button className="text-gray-400 hover:text-white p-1" onClick={() => setMobileOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
                  {(['Products', 'Account'] as const).map((group) => (
                    <div key={group}>
                      <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-4 mb-2 mt-4 first:mt-2 block">{group}</span>
                      {navItems.filter((item) => item.group === group).map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => linkClass(isActive)}>
                          <item.icon size={18} />
                          <span>{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </nav>
                <div className="p-4 border-t border-white/[0.04]">
                  {user && (
                    <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.02]">
                      <UserAvatar name={user.name} />
                      <div className="min-w-0 flex-1">
                        <span className="text-white text-sm font-medium block truncate">{user.name}</span>
                        <span className="text-gray-500 text-[10px] block truncate">{user.email}</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-5 sm:p-6 lg:p-8 pb-24 md:pb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0AF5D6]/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.04] md:hidden">
          <div className="flex items-center justify-around py-2">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    isActive ? 'text-[#0AF5D6]' : 'text-gray-500'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium text-gray-500"
            >
              <Menu size={20} />
              <span>More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
