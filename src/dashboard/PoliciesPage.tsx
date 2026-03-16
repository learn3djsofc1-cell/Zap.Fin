import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, DollarSign, Users, Clock, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import CurrencyBadge, { CurrencyToggle } from '../components/CurrencyBadge';

function formatNumber(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
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

export default function PoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editPolicy, setEditPolicy] = useState<any>(null);
  const [deletePolicy, setDeletePolicy] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formMaxPerTx, setFormMaxPerTx] = useState('500');
  const [formDailyLimit, setFormDailyLimit] = useState('5000');
  const [formMonthlyLimit, setFormMonthlyLimit] = useState('100000');
  const [formMultiSig, setFormMultiSig] = useState(false);
  const [formMultiSigThreshold, setFormMultiSigThreshold] = useState('2');
  const [formMerchants, setFormMerchants] = useState('');
  const [formCurrencies, setFormCurrencies] = useState<string[]>(['USDC']);
  const [formAgentIds, setFormAgentIds] = useState<number[]>([]);

  const fetchPolicies = () => {
    api.policies.list()
      .then((data) => setPolicies(data.policies))
      .catch(() => toast('error', 'Failed to load policies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const openCreate = () => {
    setFormName(''); setFormMaxPerTx('500'); setFormDailyLimit('5000'); setFormMonthlyLimit('100000');
    setFormMultiSig(false); setFormMultiSigThreshold('2'); setFormMerchants(''); setFormCurrencies(['USDC']); setFormAgentIds([]);
    api.agents.list().then((d) => setAgents(d.agents)).catch(() => {});
    setShowCreate(true);
  };

  const openEdit = (policy: any) => {
    setFormName(policy.name);
    setFormMaxPerTx(String(parseFloat(policy.max_per_tx) || 0));
    setFormDailyLimit(String(parseFloat(policy.daily_limit) || 0));
    setFormMonthlyLimit(String(parseFloat(policy.monthly_limit) || 0));
    setFormMultiSig(!!policy.multi_sig);
    setFormMultiSigThreshold(String(policy.multi_sig_threshold || 2));
    setFormMerchants((policy.allowed_merchants || []).join(', '));
    setFormCurrencies(policy.allowed_currencies || ['USDC']);
    setFormAgentIds(policy.assigned_agent_ids || []);
    api.agents.list().then((d) => setAgents(d.agents)).catch(() => {});
    setEditPolicy(policy);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast('error', 'Policy name is required'); return; }
    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        maxPerTx: parseFloat(formMaxPerTx) || 0,
        dailyLimit: parseFloat(formDailyLimit) || 0,
        monthlyLimit: parseFloat(formMonthlyLimit) || 0,
        multiSig: formMultiSig,
        multiSigThreshold: formMultiSig ? parseInt(formMultiSigThreshold) || 2 : 1,
        allowedMerchants: formMerchants.trim() ? formMerchants.split(',').map(m => m.trim()).filter(Boolean) : [],
        allowedCurrencies: formCurrencies,
        assignedAgentIds: formAgentIds,
      };

      if (editPolicy) {
        await api.policies.update(editPolicy.id, body);
        toast('success', 'Policy updated');
      } else {
        await api.policies.create(body);
        toast('success', 'Policy created');
      }
      setShowCreate(false); setEditPolicy(null);
      fetchPolicies();
    } catch (err: any) {
      toast('error', err.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePolicy) return;
    setDeleting(true);
    try {
      await api.policies.delete(deletePolicy.id);
      toast('success', 'Policy deleted');
      setDeletePolicy(null);
      fetchPolicies();
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete policy');
    } finally {
      setDeleting(false);
    }
  };

  const toggleAgentId = (id: number) => {
    setFormAgentIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Spending Policies</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${policies.length} ${policies.length === 1 ? 'policy' : 'policies'}`}
          </p>
        </div>
        <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FF6940]/20 self-start sm:self-auto">
          <Plus size={16} /> Create Policy
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : policies.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={28} />}
          title="No policies yet"
          description="Create spending policies to enforce limits and controls on your agent accounts."
          action={
            <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
              <Plus size={16} /> Create Policy
            </button>
          }
        />
      ) : (
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
                      <span className="text-gray-500 text-[10px] font-mono">{policy.policy_id_slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">{policy.status}</span>
                    </div>
                    <div className="relative">
                      <button className="text-gray-600 hover:text-gray-400 p-1" onClick={() => setMenuOpen(menuOpen === policy.id ? null : policy.id)}>
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === policy.id && (
                        <div className="absolute right-0 top-8 bg-[#111318] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-20 min-w-[140px]">
                          <button
                            onClick={() => openEdit(policy)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => { setDeletePolicy(policy); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign size={10} className="text-gray-600" />
                      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Max/TX</span>
                    </div>
                    <span className="text-white text-sm font-bold">{formatNumber(parseFloat(policy.max_per_tx) || 0)}</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock size={10} className="text-gray-600" />
                      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Daily</span>
                    </div>
                    <span className="text-white text-sm font-bold">{formatNumber(parseFloat(policy.daily_limit) || 0)}</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={10} className="text-gray-600" />
                      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">Agents</span>
                    </div>
                    <span className="text-white text-sm font-bold">{(policy.assigned_agent_ids || []).length}</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider block mb-1">Multi-Sig</span>
                    {policy.multi_sig ? (
                      <span className="text-[#FF6940] text-sm font-bold">{policy.multi_sig_threshold} of 3</span>
                    ) : (
                      <span className="text-gray-500 text-sm font-bold">Off</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Merchants:</span>
                  {(policy.allowed_merchants || []).length === 0 ? (
                    <span className="bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded text-[10px] font-medium">None</span>
                  ) : (
                    (policy.allowed_merchants || []).map((m: string) => (
                      <span key={m} className="bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono">{m}</span>
                    ))
                  )}
                  <span className="text-gray-700 text-[10px] mx-1">|</span>
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Currencies:</span>
                  {(policy.allowed_currencies || []).map((c: string) => (
                    <CurrencyBadge key={c} currency={c} size="sm" />
                  ))}
                </div>
              </div>
              <div className="border-t border-white/[0.03] px-5 sm:px-6 py-3 flex items-center justify-between bg-white/[0.01]">
                <span className="text-gray-600 text-xs">Created {timeAgo(policy.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCreate || !!editPolicy}
        onClose={() => { setShowCreate(false); setEditPolicy(null); }}
        title={editPolicy ? 'Edit Policy' : 'Create Policy'}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Policy Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Default Spending Policy"
              className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Max/TX ($)</label>
              <input type="number" min="0" step="1" value={formMaxPerTx} onChange={(e) => setFormMaxPerTx(e.target.value)}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF6940]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Daily ($)</label>
              <input type="number" min="0" step="1" value={formDailyLimit} onChange={(e) => setFormDailyLimit(e.target.value)}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF6940]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Monthly ($)</label>
              <input type="number" min="0" step="1" value={formMonthlyLimit} onChange={(e) => setFormMonthlyLimit(e.target.value)}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF6940]/40 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Allowed Merchants</label>
            <input
              type="text"
              value={formMerchants}
              onChange={(e) => setFormMerchants(e.target.value)}
              placeholder="Comma-separated (leave empty for none)"
              className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Allowed Currencies</label>
            <CurrencyToggle selected={formCurrencies} onChange={setFormCurrencies} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Multi-Sig</label>
              <button
                type="button"
                onClick={() => setFormMultiSig(!formMultiSig)}
                className={`w-10 h-5 rounded-full transition-colors relative ${formMultiSig ? 'bg-[#FF6940]' : 'bg-white/[0.1]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${formMultiSig ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formMultiSig && (
              <input
                type="number"
                min="2"
                max="10"
                value={formMultiSigThreshold}
                onChange={(e) => setFormMultiSigThreshold(e.target.value)}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF6940]/40 transition-colors"
                placeholder="Threshold (e.g. 2)"
              />
            )}
          </div>

          {agents.length > 0 && (
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Assign Agents</label>
              <div className="flex flex-wrap gap-2">
                {agents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAgentId(a.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      formAgentIds.includes(a.id)
                        ? 'bg-[#FF6940]/15 text-[#FF6940] border border-[#FF6940]/30'
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowCreate(false); setEditPolicy(null); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF6940] hover:bg-[#E85C38] disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              {saving ? 'Saving...' : editPolicy ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletePolicy}
        onClose={() => setDeletePolicy(null)}
        onConfirm={handleDelete}
        title="Delete Policy"
        message={`Are you sure you want to delete "${deletePolicy?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
