import { useEffect, useState } from 'react';
import { Bot, ArrowLeftRight, DollarSign, Timer, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { StatSkeleton, TableRowSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../lib/toast';
import CurrencyBadge from '../components/CurrencyBadge';

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function OverviewPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.overview.get()
      .then((data) => {
        setStats(data.stats);
        setActivity(data.recentActivity);
      })
      .catch(() => toast('error', 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Agent Accounts', value: String(stats.activeAgents), icon: Bot, color: 'text-blue-400', bg: 'bg-blue-400/8' },
    { label: 'Transactions (24h)', value: String(stats.transactions24h), icon: ArrowLeftRight, color: 'text-green-400', bg: 'bg-green-400/8' },
    { label: 'Total Volume', value: formatCurrency(stats.totalVolume), icon: DollarSign, color: 'text-[#FF6940]', bg: 'bg-[#FF6940]/8' },
    { label: 'Avg Settlement', value: stats.avgSettlementMs > 0 ? `${stats.avgSettlementMs}ms` : '-', icon: Timer, color: 'text-purple-400', bg: 'bg-purple-400/8' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time overview of your agent infrastructure</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          statCards.map((s) => (
            <div key={s.label} className="bg-[#0D0E12] rounded-2xl p-5 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={18} className={s.color} />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white block">{s.value}</span>
              <span className="text-gray-500 text-xs mt-1 block">{s.label}</span>
            </div>
          ))
        )}
      </div>

      <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <Activity size={16} className="text-[#FF6940]" />
          <span className="text-white text-sm font-bold">Recent Activity</span>
          {!loading && <span className="text-gray-600 text-xs ml-auto">{activity.length} transactions</span>}
        </div>

        {loading ? (
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            </tbody>
          </table>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={28} />}
            title="No transactions yet"
            description="Transactions will appear here once your agents start transacting."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111318]">
                  <th className="text-left text-gray-500 font-medium px-6 py-3 text-xs uppercase tracking-wider">Agent</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden sm:table-cell">Recipient</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden md:table-cell">Latency</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((tx) => (
                  <tr key={tx.id} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-white text-xs font-medium">{tx.agent_name || '-'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-gray-400 text-xs">{tx.recipient}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xs font-semibold">{parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <CurrencyBadge currency={tx.currency || 'USDC'} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-gray-400 text-xs font-mono">{tx.latency_ms ? `${tx.latency_ms}ms` : '-'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'settled' ? 'bg-green-500/10 text-green-400' :
                        tx.status === 'blocked' ? 'bg-red-500/10 text-red-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-gray-500 text-xs">{timeAgo(tx.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
