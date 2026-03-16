import { Bot, Plus, Circle, Wallet, Clock, MoreVertical } from 'lucide-react';

const agents = [
  { id: 'agent_01', name: 'trading_bot_01', status: 'active', balance: '$45,230.00', currency: 'USDC', created: 'Mar 2, 2026', txCount: 4821, lastActive: '2 min ago', purpose: 'Market making on DEX aggregators' },
  { id: 'agent_02', name: 'rebalancer_02', status: 'active', balance: '$18,750.50', currency: 'USDC', created: 'Mar 5, 2026', txCount: 1293, lastActive: '15 min ago', purpose: 'Portfolio rebalancing across vaults' },
  { id: 'agent_03', name: 'market_maker_03', status: 'active', balance: '$92,100.00', currency: 'USDC', created: 'Feb 28, 2026', txCount: 12047, lastActive: '8 min ago', purpose: 'Liquidity provision on orderbooks' },
  { id: 'agent_04', name: 'ops_agent_07', status: 'active', balance: '$3,420.00', currency: 'USDC', created: 'Mar 10, 2026', txCount: 287, lastActive: '23 min ago', purpose: 'Operational expense management' },
  { id: 'agent_05', name: 'compliance_bot', status: 'active', balance: '$150,000.00', currency: 'USDC', created: 'Feb 15, 2026', txCount: 56, lastActive: '45 min ago', purpose: 'Reserve management and compliance' },
  { id: 'agent_06', name: 'yield_optimizer', status: 'paused', balance: '$8,900.25', currency: 'USDC', created: 'Mar 8, 2026', txCount: 634, lastActive: '3h ago', purpose: 'Yield farming optimization' },
  { id: 'agent_07', name: 'payment_router', status: 'active', balance: '$22,340.00', currency: 'USDC', created: 'Mar 1, 2026', txCount: 3891, lastActive: '1 min ago', purpose: 'Merchant payment routing' },
  { id: 'agent_08', name: 'data_buyer_09', status: 'active', balance: '$1,205.00', currency: 'USDC', created: 'Mar 12, 2026', txCount: 145, lastActive: '31 min ago', purpose: 'API data feed procurement' },
];

export default function AgentsPage() {
  const activeCount = agents.filter(a => a.status === 'active').length;
  const pausedCount = agents.filter(a => a.status === 'paused').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Agents</h1>
          <p className="text-gray-500 text-sm mt-1">{activeCount} active, {pausedCount} paused</p>
        </div>
        <button className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FF6940]/20 self-start sm:self-auto">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] hover:border-[#FF6940]/10 transition-colors overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6940]/8 flex items-center justify-center">
                    <Bot size={18} className="text-[#FF6940]" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{agent.name}</span>
                    <span className="text-gray-500 text-[10px] font-mono">{agent.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                    agent.status === 'active' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <Circle size={6} className={`fill-current ${agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{agent.status}</span>
                  </div>
                  <button className="text-gray-600 hover:text-gray-400 p-1">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              <p className="text-gray-500 text-xs mb-4 leading-relaxed">{agent.purpose}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wallet size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Balance</span>
                  </div>
                  <span className="text-white text-sm font-bold">{agent.balance}</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Last Active</span>
                  </div>
                  <span className="text-white text-sm font-bold">{agent.lastActive}</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider block mb-1">Transactions</span>
                  <span className="text-white text-sm font-bold">{agent.txCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
