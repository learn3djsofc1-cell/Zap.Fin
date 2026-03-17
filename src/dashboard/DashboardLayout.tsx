import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, ArrowLeftRight, ShieldCheck, Key, Plug, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true, group: 'Platform' },
  { to: '/app/agents', icon: Bot, label: 'Agents', end: false, group: 'Platform' },
  { to: '/app/transactions', icon: ArrowLeftRight, label: 'Transactions', end: false, group: 'Platform' },
  { to: '/app/policies', icon: ShieldCheck, label: 'Policies', end: false, group: 'Platform' },
  { to: '/app/api-keys', icon: Key, label: 'API Keys', end: false, group: 'Developer' },
  { to: '/app/integrations', icon: Plug, label: 'Integrations', end: false, group: 'Developer' },
];

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
          {(['Platform', 'Developer'] as const).map((group) => (
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
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[#0AF5D6] text-xs font-semibold">Live</span>
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

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute top-0 left-0 w-72 h-full bg-[#0A0A0A] border-r border-white/[0.04] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                {(['Platform', 'Developer'] as const).map((group) => (
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
            </div>
          </div>
        )}

        <main className="flex-1 p-5 sm:p-6 lg:p-8 pb-24 md:pb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0AF5D6]/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.04] md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.filter(item => item.group === 'Platform').map((item) => (
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
