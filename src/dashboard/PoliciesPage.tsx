import { ShieldCheck, Plus, Check, X as XIcon, DollarSign, Users, Clock } from 'lucide-react';

const policies = [
  {
    id: 'pol_001',
    name: 'Standard Trading Policy',
    agents: ['trading_bot_01', 'market_maker_03'],
    agentCount: 2,
    status: 'active',
    rules: {
      maxPerTransaction: 500,
      dailyLimit: 5000,
      monthlyLimit: 100000,
      allowedMerchants: ['*'],
      requireMultiSig: false,
      multiSigThreshold: 0,
      allowedCurrencies: ['USDC'],
    },
    created: 'Feb 28, 2026',
    lastTriggered: '2 min ago',
  },
  {
    id: 'pol_002',
    name: 'High-Value Transfer Policy',
    agents: ['compliance_bot'],
    agentCount: 1,
    status: 'active',
    rules: {
      maxPerTransaction: 50000,
      dailyLimit: 200000,
      monthlyLimit: 2000000,
      allowedMerchants: ['reserve_acct', 'treasury_pool', 'cold_storage'],
      requireMultiSig: true,
      multiSigThreshold: 2,
      allowedCurrencies: ['USDC'],
    },
    created: 'Feb 15, 2026',
    lastTriggered: '45 min ago',
  },
  {
    id: 'pol_003',
    name: 'Operations Expense Policy',
    agents: ['ops_agent_07', 'data_buyer_09'],
    agentCount: 2,
    status: 'active',
    rules: {
      maxPerTransaction: 1000,
      dailyLimit: 3000,
      monthlyLimit: 25000,
      allowedMerchants: ['cloud_provider', 'api_provider', 'data_feed_svc'],
      requireMultiSig: false,
      multiSigThreshold: 0,
      allowedCurrencies: ['USDC'],
    },
    created: 'Mar 10, 2026',
    lastTriggered: '23 min ago',
  },
  {
    id: 'pol_004',
    name: 'Rebalancing Policy',
    agents: ['rebalancer_02', 'yield_optimizer'],
    agentCount: 2,
    status: 'active',
    rules: {
      maxPerTransaction: 10000,
      dailyLimit: 50000,
      monthlyLimit: 500000,
      allowedMerchants: ['*'],
      requireMultiSig: false,
      multiSigThreshold: 0,
      allowedCurrencies: ['USDC', 'SOL'],
    },
    created: 'Mar 5, 2026',
    lastTriggered: '15 min ago',
  },
  {
    id: 'pol_005',
    name: 'Payment Routing Policy',
    agents: ['payment_router'],
    agentCount: 1,
    status: 'active',
    rules: {
      maxPerTransaction: 5000,
      dailyLimit: 100000,
      monthlyLimit: 1000000,
      allowedMerchants: ['*'],
      requireMultiSig: false,
      multiSigThreshold: 0,
      allowedCurrencies: ['USDC'],
    },
    created: 'Mar 1, 2026',
    lastTriggered: '1 min ago',
  },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export default function PoliciesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Policies</h1>
          <p className="text-gray-500 text-sm mt-1">{policies.length} active policies</p>
        </div>
        <button className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FF6940]/20 self-start sm:self-auto">
          <Plus size={16} /> Create Policy
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] hover:border-[#FF6940]/10 transition-colors overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6940]/8 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#FF6940]" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{policy.name}</span>
                    <span className="text-gray-500 text-[10px] font-mono">{policy.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">{policy.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Max/TX</span>
                  </div>
                  <span className="text-white text-sm font-bold">{formatNumber(policy.rules.maxPerTransaction)}</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Daily</span>
                  </div>
                  <span className="text-white text-sm font-bold">{formatNumber(policy.rules.dailyLimit)}</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Users size={10} className="text-gray-600" />
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Agents</span>
                  </div>
                  <span className="text-white text-sm font-bold">{policy.agentCount}</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider block mb-1">Multi-Sig</span>
                  {policy.rules.requireMultiSig ? (
                    <span className="text-[#FF6940] text-sm font-bold">{policy.rules.multiSigThreshold} of 3</span>
                  ) : (
                    <span className="text-gray-500 text-sm font-bold">Off</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Merchants:</span>
                {policy.rules.allowedMerchants[0] === '*' ? (
                  <span className="bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded text-[10px] font-medium">All merchants</span>
                ) : (
                  policy.rules.allowedMerchants.map((m) => (
                    <span key={m} className="bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono">{m}</span>
                  ))
                )}
                <span className="text-gray-700 text-[10px] mx-1">|</span>
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Currencies:</span>
                {policy.rules.allowedCurrencies.map((c) => (
                  <span key={c} className="bg-[#FF6940]/5 text-[#FF6940] px-2 py-0.5 rounded text-[10px] font-bold">{c}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.03] px-5 sm:px-6 py-3 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-xs">Created {policy.created}</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-600 text-xs">Last triggered {policy.lastTriggered}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {policy.agents.map((a) => (
                  <span key={a} className="text-gray-500 text-[10px] font-mono bg-white/[0.03] px-1.5 py-0.5 rounded">{a}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
