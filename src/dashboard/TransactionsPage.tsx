import { useEffect, useState, useCallback } from 'react';
import { ArrowLeftRight, Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { TableRowSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import CurrencyBadge, { CurrencySelect } from '../components/CurrencyBadge';

const PAGE_SIZE = 20;

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  const [formAgentId, setFormAgentId] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('USDC');

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    api.transactions.list({
      search: search.trim() || undefined,
      status: filter,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((data) => {
        setTransactions(data.transactions);
        setTotal(data.total);
      })
      .catch(() => toast('error', 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [search, filter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  useEffect(() => {
    setPage(0);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreate = () => {
    setFormAgentId(''); setFormRecipient(''); setFormAmount(''); setFormCurrency('USDC');
    api.agents.list().then((d) => setAgents(d.agents)).catch(() => {});
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!formRecipient.trim()) { toast('error', 'Recipient is required'); return; }
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) { toast('error', 'Valid amount is required'); return; }

    setSaving(true);
    try {
      await api.transactions.create({
        agentId: formAgentId ? parseInt(formAgentId) : undefined,
        recipient: formRecipient.trim(),
        amount: parseFloat(formAmount),
        currency: formCurrency,
      });
      toast('success', 'Transaction created');
      setShowCreate(false);
      setPage(0);
      fetchTransactions();
    } catch (err: any) {
      toast('error', err.message || 'Failed to create transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${total} total`}
          </p>
        </div>
        <button onClick={openCreate} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#0AF5D6]/20 self-start sm:self-auto">
          <Plus size={16} /> New Transaction
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent, recipient, or hash..."
            className="w-full bg-[#0A0A0A] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/30 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-600" />
          {(['all', 'settled', 'blocked', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20' : 'text-gray-500 hover:text-gray-300 bg-white/[0.02] border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
        {loading ? (
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
            </tbody>
          </table>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={28} />}
            title="No transactions found"
            description={search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Transactions will appear here once your agents start transacting.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111111]">
                  <th className="text-left text-gray-500 font-medium px-6 py-3 text-xs uppercase tracking-wider">TX Hash</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Agent</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden sm:table-cell">Recipient</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden md:table-cell">Latency</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wider hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-[#0AF5D6] text-xs font-mono">{tx.tx_hash?.slice(0, 12) || '-'}</span>
                    </td>
                    <td className="px-4 py-3.5">
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
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'settled' ? 'bg-green-400' :
                          tx.status === 'blocked' ? 'bg-red-400' :
                          tx.status === 'pending' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
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

        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.04]">
            <span className="text-gray-500 text-xs">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-gray-400 text-xs px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Transaction">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Agent (optional)</label>
            <select
              value={formAgentId}
              onChange={(e) => setFormAgentId(e.target.value)}
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0AF5D6]/40 transition-colors"
            >
              <option value="">No agent</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Recipient</label>
            <input
              type="text"
              value={formRecipient}
              onChange={(e) => setFormRecipient(e.target.value)}
              placeholder="e.g. vendor_alpha"
              className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Currency</label>
              <CurrencySelect value={formCurrency} onChange={setFormCurrency} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 text-black px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              {saving ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
