import { useEffect, useState } from 'react';
import { Plug, Unplug, Settings, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { CardSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';

const PROVIDER_ICONS: Record<string, string> = {
  openclaw: '🦞',
  claude: '🤖',
};

const PROVIDER_DOCS: Record<string, string> = {
  openclaw: 'https://openclaw.dev',
  claude: 'https://docs.anthropic.com',
};

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModal, setConfigModal] = useState<any>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const fetchIntegrations = () => {
    api.integrations.list()
      .then((data) => setIntegrations(data.integrations))
      .catch(() => toast('error', 'Failed to load integrations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIntegrations(); }, []);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      await api.integrations.connect(provider, {});
      toast('success', 'Integration connected');
      fetchIntegrations();
    } catch (err: any) {
      toast('error', err.message || 'Failed to connect');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    setConnecting(provider);
    try {
      await api.integrations.disconnect(provider);
      toast('success', 'Integration disconnected');
      fetchIntegrations();
    } catch (err: any) {
      toast('error', err.message || 'Failed to disconnect');
    } finally {
      setConnecting(null);
    }
  };

  const openConfig = (integration: any) => {
    const vals: Record<string, string> = {};
    (integration.configFields || []).forEach((f: string) => {
      vals[f] = integration.config?.[f] || '';
    });
    setConfigValues(vals);
    setConfigModal(integration);
  };

  const saveConfig = async () => {
    if (!configModal) return;
    try {
      if (configModal.status === 'disconnected') {
        await api.integrations.connect(configModal.id, configValues);
      } else {
        await api.integrations.updateConfig(configModal.id, configValues);
      }
      toast('success', 'Configuration saved');
      setConfigModal(null);
      fetchIntegrations();
    } catch (err: any) {
      toast('error', err.message || 'Failed to save configuration');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Integrations</h1>
        <p className="text-gray-500 text-sm mt-1">Connect external services to extend your agent capabilities</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] hover:border-[#FF6940]/10 transition-colors overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FF6940]/8 flex items-center justify-center text-2xl">
                      {PROVIDER_ICONS[integration.id] || '🔌'}
                    </div>
                    <div>
                      <span className="text-white font-bold text-base block">{integration.name}</span>
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{integration.category}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                    integration.status === 'connected' ? 'bg-green-500/10' : 'bg-gray-500/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      integration.status === 'connected' ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500 text-xs leading-relaxed mb-5">{integration.description}</p>

                <div className="flex items-center gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => openConfig(integration)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                      >
                        <Settings size={13} /> Configure
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        disabled={connecting === integration.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Unplug size={13} /> {connecting === integration.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (integration.configFields?.length > 0) {
                          openConfig(integration);
                        } else {
                          handleConnect(integration.id);
                        }
                      }}
                      disabled={connecting === integration.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#FF6940] hover:bg-[#E85C38] transition-colors disabled:opacity-50"
                    >
                      <Plug size={13} /> {connecting === integration.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                  {PROVIDER_DOCS[integration.id] && (
                    <a
                      href={PROVIDER_DOCS[integration.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink size={12} /> Docs
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!configModal} onClose={() => setConfigModal(null)} title={`Configure ${configModal?.name || ''}`}>
        <div className="space-y-4">
          {configModal?.id === 'claude' && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
              <span className="text-blue-400 text-xs font-semibold block mb-1">Replit AI Integration</span>
              <span className="text-blue-400/70 text-[11px]">Claude is available through Replit AI Integration. No API key required — charges are billed to your Replit credits.</span>
            </div>
          )}
          {configModal?.id === 'openclaw' && (
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3">
              <span className="text-purple-400 text-xs font-semibold block mb-1">MCP Integration</span>
              <span className="text-purple-400/70 text-[11px]">OpenClaw uses the Model Context Protocol to enable AI agents to interact with Molt.Fin financial operations through natural language.</span>
            </div>
          )}
          {(configModal?.configFields || []).map((field: string) => (
            <div key={field}>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {field.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={configValues[field] || ''}
                onChange={(e) => setConfigValues({ ...configValues, [field]: e.target.value })}
                placeholder={field === 'mcp_endpoint' ? 'https://your-mcp-server.example.com' : field === 'agent_id' ? 'agent_prod_01' : field === 'model' ? 'claude-sonnet-4-5' : field === 'max_tokens' ? '4096' : ''}
                className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6940]/40 transition-colors"
              />
            </div>
          ))}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setConfigModal(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={saveConfig}
              className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              {configModal?.status === 'connected' ? 'Save Changes' : 'Connect & Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
