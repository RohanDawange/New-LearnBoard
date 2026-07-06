const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('lb-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { name: string; email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    profile: () => request<any>('/auth/profile'),
    updateProfile: (data: any) =>
      request<any>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  sync: {
    push: (data: any) =>
      request<{ ok: boolean }>('/sync/push', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    pull: () => request<any>('/sync/pull'),
  },
}
