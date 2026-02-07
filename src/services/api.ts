function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expiree');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || 'Erreur serveur');
  }

  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>('/api/auth?action=me'),
};

export const reportsApi = {
  getAll: () => request<any[]>('/api/reports'),
  getById: (id: number) => request<any>(`/api/reports?id=${id}`),
  create: (data: any) =>
    request<any>('/api/reports', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    request<any>(`/api/reports?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  submit: (id: number) =>
    request<any>(`/api/reports?id=${id}&action=submit`, { method: 'POST' }),
  getHistory: (id: number) => request<any[]>(`/api/reports?id=${id}&action=history`),
};

export const configApi = {
  getGtCommissions: () => request<any[]>('/api/config?type=gt-commissions'),
  getManagers: () => request<any[]>('/api/config?type=managers'),
};

export const adminApi = {
  getGtCommissions: () => request<any[]>('/api/admin?type=gt-commissions'),
  createGtCommission: (name: string) =>
    request<any>('/api/admin?type=gt-commissions', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  updateGtCommission: (id: number, name: string) =>
    request<any>('/api/admin?type=gt-commissions', {
      method: 'PUT',
      body: JSON.stringify({ id, name }),
    }),
  deleteGtCommission: (id: number) =>
    request<any>(`/api/admin?type=gt-commissions&id=${id}`, { method: 'DELETE' }),

  getManagers: () => request<any[]>('/api/admin?type=managers'),
  createManager: (name: string, email: string) =>
    request<any>('/api/admin?type=managers', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),
  updateManager: (id: number, name: string, email: string) =>
    request<any>('/api/admin?type=managers', {
      method: 'PUT',
      body: JSON.stringify({ id, name, email }),
    }),
  deleteManager: (id: number) =>
    request<any>(`/api/admin?type=managers&id=${id}`, { method: 'DELETE' }),
};
