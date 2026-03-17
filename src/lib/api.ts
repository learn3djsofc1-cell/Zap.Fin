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

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<{ user: any }>('/auth/me'),
  },
  agents: {
    list: () => request<{ agents: any[] }>('/agents'),
    create: (body: { name: string; purpose?: string; currency?: string }) =>
      request<{ agent: any }>('/agents', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, any>) =>
      request<{ agent: any }>(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/agents/${id}`, { method: 'DELETE' }),
  },
  transactions: {
    list: (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      const qs = query.toString();
      return request<{ transactions: any[]; total: number; limit: number; offset: number }>(`/transactions${qs ? `?${qs}` : ''}`);
    },
    create: (body: { agentId?: number; recipient: string; amount: number; currency?: string; status?: string }) =>
      request<{ transaction: any }>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  },
  policies: {
    list: () => request<{ policies: any[] }>('/policies'),
    create: (body: Record<string, any>) =>
      request<{ policy: any }>('/policies', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, any>) =>
      request<{ policy: any }>(`/policies/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/policies/${id}`, { method: 'DELETE' }),
  },
  overview: {
    get: () => request<{ stats: any; recentActivity: any[] }>('/overview'),
  },
  apiKeys: {
    list: () => request<{ apiKeys: any[] }>('/api-keys'),
    create: (body: { label: string; environment: string }) =>
      request<{ apiKey: any; fullKey: string }>('/api-keys', { method: 'POST', body: JSON.stringify(body) }),
    revoke: (id: number) =>
      request<{ success: boolean }>(`/api-keys/${id}`, { method: 'DELETE' }),
  },
  integrations: {
    list: () => request<{ integrations: any[] }>('/integrations'),
    connect: (provider: string, config?: Record<string, any>) =>
      request<{ integration: any }>(`/integrations/${provider}/connect`, { method: 'POST', body: JSON.stringify({ config }) }),
    disconnect: (provider: string) =>
      request<{ integration: any }>(`/integrations/${provider}/disconnect`, { method: 'POST' }),
    updateConfig: (provider: string, config: Record<string, any>) =>
      request<{ integration: any }>(`/integrations/${provider}/config`, { method: 'PATCH', body: JSON.stringify({ config }) }),
  },
};
