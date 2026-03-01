const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Health
  getHealth: () => apiRequest<{ status: string; redis: string; database: string }>('/api/health'),

  // Rooms
  getRooms: () => apiRequest<{ rooms: any[]; count: number }>('/api/rooms'),
  getRoom: (id: string) => apiRequest<any>(`/api/rooms/${id}`),
  createRoom: (data: any) => apiRequest<any>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRoom: (id: string, data: any) => apiRequest<any>(`/api/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  runRoom: (id: string) => apiRequest<any>(`/api/rooms/${id}/run`, { method: 'POST' }),
  getRoomLogs: (id: string) => apiRequest<{ logs: any[]; count: number }>(`/api/rooms/${id}/logs`),

  // Workflows
  getWorkflows: () => apiRequest<{ workflows: any[]; count: number }>('/api/workflows'),
  getWorkflow: (id: string) => apiRequest<any>(`/api/workflows/${id}`),
  createWorkflow: (data: any) => apiRequest<any>('/api/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Tools
  getTools: () => apiRequest<{ tools: any[]; count: number }>('/api/tools'),
}
