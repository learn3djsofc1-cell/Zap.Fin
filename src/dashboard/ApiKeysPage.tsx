import { useEffect, useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, Shield } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface ApiKey {
  id: number;
  label: string;
  key_prefix: string;
  environment: 'live' | 'test';
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
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

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const [formLabel, setFormLabel] = useState('');
  const [formEnv, setFormEnv] = useState<'live' | 'test'>('live');

  const fetchKeys = () => {
    api.apiKeys.list()
      .then((data) => setKeys(data.apiKeys))
      .catch(() => toast('error', 'Failed to load API keys'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, []);

  const openCreate = () => {
    setFormLabel(''); setFormEnv('live'); setNewKey(null); setCopiedId(null);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!formLabel.trim()) { toast('error', 'Label is required'); return; }
    setSaving(true);
    try {
      const data = await api.apiKeys.create({ label: formLabel.trim(), environment: formEnv });
      setNewKey(data.fullKey);
      fetchKeys();
      toast('success', 'API key created');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create API key';
      toast('error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeKey) return;
    setRevoking(true);
    try {
      await api.apiKeys.revoke(revokeKey.id);
      toast('success', 'API key revoked');
      setRevokeKey(null);
      fetchKeys();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke API key';
      toast('error', message);
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = async (text: string, id: number | string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast('success', 'Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast('error', 'Failed to copy');
    }
  };

  const activeKeys = keys.filter(k => !k.revoked_at);
  const revokedKeys = keys.filter(k => k.revoked_at);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">API Keys</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${activeKeys.length} active key${activeKeys.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FF6940]/20 self-start sm:self-auto">
          <Plus size={16} /> Create API Key
        </button>
      </div>

      <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] p-5 mb-6">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-[#FF6940] mt-0.5 shrink-0" />
          <div>
            <span className="text-white text-sm font-semibold block mb-1">API Key Security</span>
            <p className="text-gray-500 text-xs leading-relaxed">
              API keys grant programmatic access to your Molt.Fin account. Keys prefixed with <code className="text-[#FF6940]">mf_live_</code> access production data. Keys prefixed with <code className="text-[#FF6940]">mf_test_</code> are sandboxed. The full key is only shown once at creation — store it securely.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : activeKeys.length === 0 && revokedKeys.length === 0 ? (
        <EmptyState
          icon={<Key size={28} />}
          title="No API keys yet"
          description="Create an API key to integrate Molt.Fin into your applications."
          action={
            <button onClick={openCreate} className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
              <Plus size={16} /> Create API Key
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {activeKeys.map((k) => (
            <div key={k.id} className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] hover:border-[#FF6940]/10 transition-colors p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6940]/8 flex items-center justify-center">
                    <Key size={18} className="text-[#FF6940]" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{k.label}</span>
                    <span className="text-gray-500 text-[10px] font-mono">{k.key_prefix}...</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    k.environment === 'live' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {k.environment}
                  </span>
                  <button
                    onClick={() => copyToClipboard(k.key_prefix, k.id)}
                    className="text-gray-600 hover:text-white p-1.5 transition-colors"
                    title="Copy key prefix"
                  >
                    {copiedId === k.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => setRevokeKey(k)}
                    className="text-gray-600 hover:text-red-400 p-1.5 transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-gray-600 text-[10px]">
                <span>Created {timeAgo(k.created_at)}</span>
                {k.last_used_at && <span>Last used {timeAgo(k.last_used_at)}</span>}
              </div>
            </div>
          ))}

          {revokedKeys.length > 0 && (
            <>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-1 mt-4">Revoked</span>
              {revokedKeys.map((k) => (
                <div key={k.id} className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] p-5 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                      <Key size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold text-sm block line-through">{k.label}</span>
                      <span className="text-gray-600 text-[10px] font-mono">{k.key_prefix}</span>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400">
                      Revoked
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setNewKey(null); }} title={newKey ? 'API Key Created' : 'Create API Key'}>
        {newKey ? (
          <div className="space-y-4">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
              <span className="text-yellow-400 text-xs font-semibold block mb-1">Copy your key now</span>
              <span className="text-yellow-400/70 text-[11px]">This key will only be shown once. Store it in a secure location.</span>
            </div>
            <div className="bg-[#111318] rounded-xl px-4 py-3 flex items-center gap-3 border border-white/[0.06]">
              <code className="text-[#FF6940] text-xs font-mono flex-1 break-all select-all">{newKey}</code>
              <button
                onClick={() => copyToClipboard(newKey, 'new-key')}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                {copiedId === 'new-key' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setShowCreate(false); setNewKey(null); }}
                className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Label</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Production Backend"
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Environment</label>
              <div className="flex gap-2">
                {(['live', 'test'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setFormEnv(env)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      formEnv === env
                        ? env === 'live'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
                    }`}
                  >
                    {env === 'live' ? 'Live (mf_live_)' : 'Test (mf_test_)'}
                  </button>
                ))}
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
                className="bg-[#FF6940] hover:bg-[#E85C38] disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
              >
                {saving ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!revokeKey}
        onClose={() => setRevokeKey(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${revokeKey?.label}"? Applications using this key will lose access immediately.`}
        loading={revoking}
      />
    </div>
  );
}
