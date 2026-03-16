import { useEffect, useState } from 'react';
import { Bot, Plus, Circle, Wallet, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentsPage() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAgent, setEditAgent] = useState<any>(null);
  const [deleteAgent, setDeleteAgent] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formCurrency, setFormCurrency] = useState('USDC');

  const fetchAgents = () => {
    api.agents.list()
      .then((data) => setAgents(data.agents))
      .catch(() => toast('error', 'Failed to load agents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgents(); }, []);

  const openCreate = () => {
    setFormName(''); setFormPurpose(''); setFormCurrency('USDC');
    setShowCreate(true);
  };

  const openEdit = (agent: any) => {
    setFormName(agent.name);
    setFormPurpose(agent.purpose || '');
    setFormCurrency(agent.currency || 'USDC');
    setEditAgent(agent);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast('error', 'Agent name is required'); return; }
    setSaving(true);
    try {
      if (editAgent) {
        await api.agents.update(editAgent.id, { name: formName.trim(), purpose: formPurpose.trim(), status: editAgent.status });
        toast('success', 'Agent updated');
      } else {
        await api.agents.create({ name: formName.trim(), purpose: formPurpose.trim(), currency: formCurrency });
        toast('success', 'Agent created');
      }
      setShowCreate(false); setEditAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast('error', err.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAgent) return;
    setDeleting(true);
    try {
      await api.agents.delete(deleteAgent.id);
      toast('success', 'Agent deleted');
      setDeleteAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete agent');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (agent: any) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    try {
      await api.agents.update(agent.id, { status: newStatus });
      toast('success', `Agent ${newStatus === 'active' ? 'activated' : 'paused'}`);
      fetchAgents();
    } catch (err: any) {
      toast('error', err.message || 'Failed to update status');
    }
    setMenuOpen(null);
  };

  const activeCount = agents.filter(a => a.status === 'active').length;
  const pausedCount = agents.filter(a => a.status === 'paused').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Agents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${activeCount} active, ${pausedCount} paused`}
          </p>
        </div>
        <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FF6940]/20 self-start sm:self-auto">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : agents.length === 0 ? (
        <EmptyState
          icon={<Bot size={28} />}
          title="No agents yet"
          description="Create your first AI agent to start managing autonomous transactions."
          action={
            <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
              <Plus size={16} /> Create Agent
            </button>
          }
        />
      ) : (
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
                      <span className="text-gray-500 text-[10px] font-mono">{agent.agent_id_slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                      agent.status === 'active' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                    }`}>
                      <Circle size={6} className={`fill-current ${agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{agent.status}</span>
                    </div>
                    <div className="relative">
                      <button className="text-gray-600 hover:text-gray-400 p-1" onClick={() => setMenuOpen(menuOpen === agent.id ? null : agent.id)}>
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === agent.id && (
                        <div className="absolute right-0 top-8 bg-[#111318] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-20 min-w-[140px]">
                          <button
                            onClick={() => openEdit(agent)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(agent)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                          >
                            <Circle size={13} /> {agent.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => { setDeleteAgent(agent); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {agent.purpose && <p className="text-gray-500 text-xs mb-4 leading-relaxed">{agent.purpose}</p>}

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet size={10} className="text-gray-600" />
                      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Balance</span>
                    </div>
                    <span className="text-white text-sm font-bold">${parseFloat(agent.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={10} className="text-gray-600" />
                      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Updated</span>
                    </div>
                    <span className="text-white text-sm font-bold">{timeAgo(agent.updated_at)}</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider block mb-1">TXs</span>
                    <span className="text-white text-sm font-bold">{parseInt(agent.tx_count || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCreate || !!editAgent}
        onClose={() => { setShowCreate(false); setEditAgent(null); }}
        title={editAgent ? 'Edit Agent' : 'Create Agent'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. trading_bot_01"
              className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Purpose</label>
            <textarea
              value={formPurpose}
              onChange={(e) => setFormPurpose(e.target.value)}
              placeholder="What does this agent do?"
              rows={3}
              className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors resize-none"
            />
          </div>
          {!editAgent && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Currency</label>
              <select
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value)}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF6940]/40 transition-colors"
              >
                <option value="USDC">USDC</option>
                <option value="SOL">SOL</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowCreate(false); setEditAgent(null); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF6940] hover:bg-[#E85C38] disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              {saving ? 'Saving...' : editAgent ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteAgent}
        onClose={() => setDeleteAgent(null)}
        onConfirm={handleDelete}
        title="Delete Agent"
        message={`Are you sure you want to delete "${deleteAgent?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
