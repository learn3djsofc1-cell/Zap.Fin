import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ArrowUpCircle, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { label: 'Overview', path: '/app', icon: LayoutDashboard, end: true },
  { label: 'Cards', path: '/app/cards', icon: CreditCard, end: false },
  { label: 'Fund', path: '/app/topups', icon: ArrowUpCircle, end: false },
  { label: 'Security', path: '/app/controls', icon: Shield, end: false },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col md:flex-row">
      <aside className="hidden md:flex sticky top-0 left-0 z-50 h-screen w-[220px] bg-[#111215] flex-col shrink-0">
        <div className="px-5 py-5 flex items-center border-b border-white/5">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="WispTap" className="w-7 h-7 rounded-lg" />
            <span className="text-white font-bold text-base tracking-tight">WispTap</span>
          </button>
        </div>

        <div className="px-3 pt-5 pb-2">
          <span className="text-gray-600 text-[9px] font-bold uppercase tracking-widest px-3">Navigation</span>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-white bg-[#FF5550]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={17} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-white/50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="bg-[#0A0B0E] rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5550] to-[#c43c38] flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">{userInitials}</span>
              </div>
              <div className="min-w-0">
                <span className="text-white text-xs font-semibold block truncate">{user?.email || 'User'}</span>
                <span className="text-gray-600 text-[10px]">Free plan</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-xs font-medium transition-colors w-full px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0A0B0E]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="md:hidden flex items-center gap-2">
              <img src="/logo.png" alt="WispTap" className="w-6 h-6 rounded-lg" />
              <span className="text-white font-bold text-sm">WispTap</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block bg-[#111215] px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-white/5 font-mono truncate max-w-[200px]">
                {user.email}
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5550] to-[#c43c38] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{userInitials}</span>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden text-gray-400 hover:text-red-400 p-1.5 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111215]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#FF5550]' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#FF5550]/10' : ''}`}>
                  <item.icon size={18} className={isActive ? 'text-[#FF5550]' : 'text-gray-500'} />
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
