import { ArrowLeftRight, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const transactions = [
  { id: 'tx_8f2a3b4c', agent: 'trading_bot_01', type: 'Payment', to: 'vendor_alpha', amount: '$249.99', currency: 'USDC', status: 'Settled', latency: '338ms', time: 'Mar 16, 14:23', hash: '5Kv2...8mFj' },
  { id: 'tx_7c1b2d3e', agent: 'market_maker_03', type: 'Transfer', to: 'treasury_pool', amount: '$12,500.00', currency: 'USDC', status: 'Settled', latency: '291ms', time: 'Mar 16, 14:15', hash: '3nRq...7xWk' },
  { id: 'tx_6d3e4f5a', agent: 'rebalancer_02', type: 'Payment', to: 'liquidity_hub', amount: '$3,420.50', currency: 'USDC', status: 'Settled', latency: '356ms', time: 'Mar 16, 14:08', hash: '9pLm...2vBn' },
  { id: 'tx_5e4f6a7b', agent: 'ops_agent_07', type: 'Payment', to: 'cloud_provider', amount: '$890.00', currency: 'USDC', status: 'Settled', latency: '312ms', time: 'Mar 16, 14:00', hash: '1sYt...6cDx' },
  { id: 'tx_4a5c7b8d', agent: 'trading_bot_01', type: 'Payment', to: 'data_feed_svc', amount: '$45.00', currency: 'USDC', status: 'Settled', latency: '387ms', time: 'Mar 16, 13:52', hash: '7wEr...4fGh' },
  { id: 'tx_3b6d8c9e', agent: 'compliance_bot', type: 'Transfer', to: 'reserve_acct', amount: '$50,000.00', currency: 'USDC', status: 'Settled', latency: '298ms', time: 'Mar 16, 13:38', hash: '2qAz...9jKl' },
  { id: 'tx_2c7e9d0f', agent: 'market_maker_03', type: 'Payment', to: 'exchange_api', amount: '$1,200.00', currency: 'USDC', status: 'Blocked', latency: '-', time: 'Mar 16, 13:31', hash: '-' },
  { id: 'tx_1d8f0e1a', agent: 'payment_router', type: 'Payment', to: 'merchant_xyz', amount: '$780.00', currency: 'USDC', status: 'Settled', latency: '325ms', time: 'Mar 16, 13:22', hash: '4uIo...8pQr' },
  { id: 'tx_0e9a1f2b', agent: 'yield_optimizer', type: 'Payment', to: 'defi_protocol', amount: '$5,600.00', currency: 'USDC', status: 'Settled', latency: '341ms', time: 'Mar 16, 13:15', hash: '6vBn...0mXc' },
  { id: 'tx_fa0b2c3d', agent: 'data_buyer_09', type: 'Payment', to: 'api_provider', amount: '$120.00', currency: 'USDC', status: 'Settled', latency: '367ms', time: 'Mar 16, 13:08', hash: '8wSd...3kLj' },
  { id: 'tx_eb1c3d4e', agent: 'trading_bot_01', type: 'Transfer', to: 'cold_storage', amount: '$25,000.00', currency: 'USDC', status: 'Settled', latency: '303ms', time: 'Mar 16, 12:55', hash: '0rTy...5nHg' },
  { id: 'tx_dc2d4e5f', agent: 'rebalancer_02', type: 'Payment', to: 'swap_protocol', amount: '$8,340.00', currency: 'USDC', status: 'Settled', latency: '329ms', time: 'Mar 16, 12:42', hash: '2eWq...7aPo' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'settled' | 'blocked'>('all');

  const filtered = transactions.filter((tx) => {
    const matchSearch = search === '' || tx.agent.toLowerCase().includes(search.toLowerCase()) || tx.to.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search);
    const matchFilter = filter === 'all' || (filter === 'settled' && tx.status === 'Settled') || (filter === 'blocked' && tx.status === 'Blocked');
    return matchSearch && matchFilter;
  });

  const settledCount = transactions.filter(t => t.status === 'Settled').length;
  const blockedCount = transactions.filter(t => t.status === 'Blocked').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{settledCount} settled, {blockedCount} blocked</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent, recipient, or ID..."
            className="w-full bg-[#0D0E12] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-600" />
          {(['all', 'settled', 'blocked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'bg-[#FF6940]/10 text-[#FF6940]' : 'text-gray-500 hover:text-gray-300 bg-white/[0.02]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#111318]">
                <th className="text-left text-gray-500 font-medium px-6 py-3 text-xs uppercase tracking-wider">TX ID</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Agent</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden sm:table-cell">Recipient</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden md:table-cell">Latency</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="text-[#FF6940] text-xs font-mono">{tx.id.slice(0, 11)}</span>
                  </td>
                  <td className="px-4 py-3.5">
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ArrowLeftRight size={32} className="text-gray-700 mb-3" />
            <span className="text-gray-500 text-sm">No transactions found</span>
          </div>
        )}
      </div>
    </div>
  );
}
