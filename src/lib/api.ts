const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('ghostlane_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('ghostlane_token', token);
  } else {
    localStorage.removeItem('ghostlane_token');
  }
}

export function getToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (res.status === 401 && !path.startsWith('/auth/')) {
    setToken(null);
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Something went wrong');
  }

  return data as T;
}

export interface MixRequest {
  sendCoin: string;
  receiveCoin: string;
  sendAmount: string;
  recipientAddress: string;
  privacyLevel: 'standard' | 'enhanced' | 'maximum';
  delayMinutes?: number;
}

export interface MixOperation {
  id: string;
  sendCoin: string;
  receiveCoin: string;
  sendAmount: string;
  receiveAmount: string;
  exchangeRate: string;
  feePercent: number;
  recipientAddress: string;
  privacyLevel: string;
  delayMinutes: number;
  status: 'pending' | 'mixing' | 'complete' | 'failed';
  depositAddress?: string;
  createdAt: string;
  completedAt?: string;
  txHash?: string;
}

export interface Conversation {
  id: string;
  contactAddress: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isEncrypted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'me' | 'them';
  timestamp: string;
  isEncrypted: boolean;
  selfDestructSeconds?: number;
}

export interface BridgeTransfer {
  id: string;
  sourceChain: string;
  destChain: string;
  token: string;
  amount: string;
  recipientAddress: string;
  status: 'initiated' | 'confirming' | 'bridging' | 'complete' | 'failed';
  depositAddress?: string;
  createdAt: string;
  completedAt?: string;
  sourceTxHash?: string;
  destTxHash?: string;
}

export interface VpnServer {
  id: string;
  country: string;
  city: string;
  latencyMs: number;
  load: number;
  protocol: string;
}

export interface VpnSession {
  connected: boolean;
  serverId?: string;
  serverName?: string;
  connectedAt?: string;
  bytesUp?: number;
  bytesDown?: number;
  assignedIp?: string;
  killSwitch: boolean;
}

export interface OverviewStats {
  privacyScore: number;
  totalMixes: number;
  activeBridges: number;
  messagesEncrypted: number;
  vpnUptime: string;
}

export interface ActivityItem {
  id: string;
  type: 'mix' | 'bridge' | 'message' | 'vpn';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface TwoFactorResponse {
  enabled: boolean;
}

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface MixPool {
  coin: string;
  size: number;
}

export interface AddressValidation {
  valid: boolean;
  error?: string;
}

export interface MixRates {
  prices: Record<string, number>;
  feePercent: number;
}

export interface Chain {
  id: string;
  name: string;
  icon: string;
  tokens: string[];
}

export interface NotificationPreference {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      request<{ user: AuthUser; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<{ user: AuthUser; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<{ user: AuthUser }>('/auth/me'),
  },
  overview: {
    stats: () => request<{ stats: OverviewStats }>('/overview/stats'),
    activity: () => request<{ activity: ActivityItem[] }>('/overview/activity'),
  },
  mixer: {
    create: (body: MixRequest) =>
      request<{ mix: MixOperation }>('/mixer', { method: 'POST', body: JSON.stringify(body) }),
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      const qs = query.toString();
      return request<{ mixes: MixOperation[]; total: number }>(`/mixer${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<{ mix: MixOperation }>(`/mixer/${id}`),
    pools: () => request<{ pools: MixPool[] }>('/mixer/pools'),
    rates: () => request<MixRates>('/mixer/rates'),
    validateAddress: (coin: string, address: string) =>
      request<AddressValidation>('/mixer/validate-address', { method: 'POST', body: JSON.stringify({ coin, address }) }),
  },
  messenger: {
    conversations: () => request<{ conversations: Conversation[] }>('/messenger/conversations'),
    messages: (conversationId: string) =>
      request<{ messages: Message[] }>(`/messenger/conversations/${conversationId}/messages`),
    send: (conversationId: string, body: { content: string; selfDestructSeconds?: number }) =>
      request<{ message: Message }>(`/messenger/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(body) }),
    createConversation: (body: { contactAddress: string }) =>
      request<{ conversation: Conversation }>('/messenger/conversations', { method: 'POST', body: JSON.stringify(body) }),
    contacts: () => request<{ contacts: { id: string; address: string }[] }>('/messenger/contacts'),
  },
  bridge: {
    create: (body: { sourceChain: string; destChain: string; token: string; amount: string; recipientAddress: string }) =>
      request<{ transfer: BridgeTransfer }>('/bridge', { method: 'POST', body: JSON.stringify(body) }),
    list: (params?: { status?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request<{ transfers: BridgeTransfer[]; total: number }>(`/bridge${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<{ transfer: BridgeTransfer }>(`/bridge/${id}`),
    chains: () => request<{ chains: Chain[] }>('/bridge/chains'),
    validateAddress: (chain: string, token: string, address: string) =>
      request<AddressValidation>('/bridge/validate-address', { method: 'POST', body: JSON.stringify({ chain, token, address }) }),
  },
  vpn: {
    servers: () => request<{ servers: VpnServer[] }>('/vpn/servers'),
    session: () => request<{ session: VpnSession }>('/vpn/session'),
    connect: (serverId: string) =>
      request<{ session: VpnSession }>(`/vpn/connect`, { method: 'POST', body: JSON.stringify({ serverId }) }),
    disconnect: () =>
      request<{ session: VpnSession }>('/vpn/disconnect', { method: 'POST' }),
    toggleKillSwitch: (enabled: boolean) =>
      request<{ session: VpnSession }>('/vpn/kill-switch', { method: 'POST', body: JSON.stringify({ enabled }) }),
  },
  settings: {
    profile: () => request<{ profile: UserProfile }>('/settings/profile'),
    updateProfile: (body: { name?: string; email?: string }) =>
      request<{ profile: UserProfile }>('/settings/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>('/settings/password', { method: 'POST', body: JSON.stringify(body) }),
    get2FAStatus: () => request<{ enabled: boolean }>('/settings/2fa'),
    toggle2FA: (enabled: boolean) =>
      request<{ twoFactor: TwoFactorResponse }>('/settings/2fa', { method: 'POST', body: JSON.stringify({ enabled }) }),
    sessions: () => request<{ sessions: UserSession[] }>('/settings/sessions'),
    revokeSession: (id: string) =>
      request<{ success: boolean }>(`/settings/sessions/${id}`, { method: 'DELETE' }),
    notifications: () => request<{ preferences: NotificationPreference[] }>('/settings/notifications'),
    updateNotification: (key: string, enabled: boolean) =>
      request<{ preference: NotificationPreference }>(`/settings/notifications/${key}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
  },
};
