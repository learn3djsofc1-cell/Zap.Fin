import { useEffect, useState } from 'react';
import { Shuffle, MessageSquare, ArrowLeftRight, Wifi, Shield, Activity, ChevronRight } from 'lucide-react';
import { api, type OverviewStats, type ActivityItem } from '../lib/api';
import { StatSkeleton, TableRowSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../lib/toast';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const productCards = [
  {
    icon: Shuffle,
    title: 'Mixer',
    description: 'Break transaction links with ZK proofs',
    to: '/app/mixer',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/15',
    hoverBorder: 'hover:border-purple-500/30',
  },
  {
    icon: MessageSquare,
    title: 'Messenger',
    description: 'End-to-end encrypted private messaging',
    to: '/app/messenger',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/15',
    hoverBorder: 'hover:border-blue-500/30',
  },
  {
    icon: ArrowLeftRight,
    title: 'Bridge',
    description: 'Anonymous cross-chain transfers',
    to: '/app/bridge',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/15',
    hoverBorder: 'hover:border-green-500/30',
  },
  {
    icon: Wifi,
    title: 'VPN',
    description: 'Military-grade VPN with Tor integration',
    to: '/app/vpn',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/15',
    hoverBorder: 'hover:border-orange-500/30',
  },
];

function PrivacyScoreRing({ score, loading }: { score: number; loading: boolean }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
        {!loading && (
          <motion.circle
            cx="64" cy="64" r={radius}
            stroke="url(#scoreGradient)" strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0AF5D6" />
            <stop offset="100%" stopColor="#06B89E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {loading ? (
          <div className="w-10 h-5 bg-white/[0.04] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Privacy</span>
          </>
        )}
      </div>
    </div>
  );
}

const activityTypeIcon: Record<string, typeof Shuffle> = {
  mix: Shuffle,
  bridge: ArrowLeftRight,
  message: MessageSquare,
  vpn: Wifi,
};

const activityTypeColor: Record<string, string> = {
  mix: 'text-purple-400 bg-purple-500/10',
  bridge: 'text-green-400 bg-green-500/10',
  message: 'text-blue-400 bg-blue-500/10',
  vpn: 'text-orange-400 bg-orange-500/10',
};

export default function OverviewPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.overview.stats(),
      api.overview.activity(),
    ]).then(([statsResult, activityResult]) => {
      if (statsResult.status === 'fulfilled') setStats(statsResult.value.stats);
      if (activityResult.status === 'fulfilled') setActivity(activityResult.value.activity);
      const failures = [statsResult, activityResult].filter(r => r.status === 'rejected');
      if (failures.length > 0) toast('error', 'Some dashboard data failed to load');
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Mixes', value: stats?.totalMixes ?? 0, icon: Shuffle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/10' },
    { label: 'Active Bridges', value: stats?.activeBridges ?? 0, icon: ArrowLeftRight, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/10' },
    { label: 'Messages Encrypted', value: stats?.messagesEncrypted ?? 0, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10' },
    { label: 'VPN Uptime', value: stats?.vpnUptime ?? '0h', icon: Wifi, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 text-sm">Your privacy ecosystem at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#0AF5D6]" />
            <span className="text-white text-sm font-bold">Privacy Score</span>
          </div>
          <PrivacyScoreRing score={stats?.privacyScore ?? 0} loading={loading} />
          <p className="text-gray-500 text-xs mt-4 text-center">Use more GhostLane products to increase your score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2 grid grid-cols-2 gap-4"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                className={`bg-[#0A0A0A] rounded-2xl p-5 border ${s.border} hover:border-[#0AF5D6]/20 transition-all group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white block">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</span>
                <span className="text-gray-500 text-xs mt-1 block">{s.label}</span>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {productCards.map((card, i) => (
          <Link
            key={card.title}
            to={card.to}
            className={`group bg-[#0A0A0A] rounded-2xl p-5 border ${card.border} ${card.hoverBorder} transition-all duration-300 hover:shadow-lg hover:shadow-black/20`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon size={18} className={card.color} />
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">{card.description}</p>
            <div className="flex items-center gap-1 text-[#0AF5D6] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open</span>
              <ChevronRight size={12} />
            </div>
          </Link>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <Activity size={16} className="text-[#0AF5D6]" />
          <span className="text-white text-sm font-bold">Recent Activity</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{activity.length} events</span>}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="flex-1">
                  <div className="w-32 h-3.5 bg-white/[0.04] rounded animate-pulse mb-2" />
                  <div className="w-48 h-3 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={<Shield size={28} />}
            title="No activity yet"
            description="Start using GhostLane products and your activity will appear here."
          />
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {activity.map((item) => {
              const Icon = activityTypeIcon[item.type] || Shield;
              const colorClass = activityTypeColor[item.type] || 'text-gray-400 bg-gray-500/10';
              return (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-medium block truncate">{item.title}</span>
                    <span className="text-gray-500 text-xs block truncate">{item.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                      item.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-[#0AF5D6]/10 text-[#0AF5D6]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'complete' ? 'bg-green-400' :
                        item.status === 'failed' ? 'bg-red-400' :
                        item.status === 'pending' ? 'bg-yellow-400' :
                        'bg-[#0AF5D6]'
                      }`} />
                      {item.status}
                    </span>
                    <span className="text-gray-600 text-[10px] block mt-1">{timeAgo(item.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
