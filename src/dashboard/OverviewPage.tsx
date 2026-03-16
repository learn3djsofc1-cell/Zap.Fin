import { Bot, ArrowLeftRight, DollarSign, Timer, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const stats = [
  { label: 'Active Agents', value: '12', change: '+3', up: true, icon: Bot, color: 'text-blue-400', bg: 'bg-blue-400/8' },
  { label: 'Transactions (24h)', value: '1,847', change: '+12.4%', up: true, icon: ArrowLeftRight, color: 'text-green-400', bg: 'bg-green-400/8' },
  { label: 'Total Volume', value: '$284,920', change: '+8.2%', up: true, icon: DollarSign, color: 'text-[#FF6940]', bg: 'bg-[#FF6940]/8' },
  { label: 'Avg Settlement', value: '342ms', change: '-18ms', up: false, icon: Timer, color: 'text-purple-400', bg: 'bg-purple-400/8' },
];

const recentActivity = [
  { id: 'tx_8f2a', agent: 'trading_bot_01', type: 'Payment', to: 'vendor_alpha', amount: '$249.99', status: 'Settled', latency: '338ms', time: '2 min ago' },
  { id: 'tx_7c1b', agent: 'market_maker_03', type: 'Transfer', to: 'treasury_pool', amount: '$12,500.00', status: 'Settled', latency: '291ms', time: '8 min ago' },
  { id: 'tx_6d3e', agent: 'rebalancer_02', type: 'Payment', to: 'liquidity_hub', amount: '$3,420.50', status: 'Settled', latency: '356ms', time: '15 min ago' },
  { id: 'tx_5e4f', agent: 'ops_agent_07', type: 'Payment', to: 'cloud_provider', amount: '$890.00', status: 'Settled', latency: '312ms', time: '23 min ago' },
  { id: 'tx_4a5c', agent: 'trading_bot_01', type: 'Payment', to: 'data_feed_svc', amount: '$45.00', status: 'Settled', latency: '387ms', time: '31 min ago' },
  { id: 'tx_3b6d', agent: 'compliance_bot', type: 'Transfer', to: 'reserve_acct', amount: '$50,000.00', status: 'Settled', latency: '298ms', time: '45 min ago' },
  { id: 'tx_2c7e', agent: 'market_maker_03', type: 'Payment', to: 'exchange_api', amount: '$1,200.00', status: 'Policy Blocked', latency: '-', time: '52 min ago' },
];

export default function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time overview of your agent infrastructure</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0D0E12] rounded-2xl p-5 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${s.label === 'Avg Settlement' ? 'text-green-400' : s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.label === 'Avg Settlement' ? <ArrowDownRight size={12} /> : s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.change}
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white block">{s.value}</span>
            <span className="text-gray-500 text-xs mt-1 block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <Activity size={16} className="text-[#FF6940]" />
          <span className="text-white text-sm font-bold">Recent Activity</span>
          <span className="text-gray-600 text-xs ml-auto">{recentActivity.length} transactions</span>
        </div>
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
              {recentActivity.map((tx) => (
                <tr key={tx.id} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="text-white text-xs font-medium">{tx.agent}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-400 text-xs">{tx.to}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-white text-xs font-semibold">{tx.amount}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-gray-400 text-xs font-mono">{tx.latency}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'Settled' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-gray-500 text-xs">{tx.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
