/**
 * @openrooms/sdk
 *
 * TypeScript-first client for the OpenRooms agent orchestration platform.
 *
 * Quick start:
 *   import { OpenRooms } from '@openrooms/sdk'
 *   const client = new OpenRooms({ apiKey: 'sk_...', baseUrl: 'https://your-api.up.railway.app' })
 *   const room = await client.rooms.create({ name: 'my-room' })
 *   const agent = await client.agents.deploy({ roomId: room.id, goal: 'Summarise weekly reports' })
 *   const run = await client.agents.run(agent.id)
 *   console.log(run.id) // track in /live-runs/:id
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string
  name: string
  description?: string
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  workflowId?: string
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: string
  name: string
  goal: string
  roomId: string
  status: string
  allowedTools: string[]
  policyConfig: { provider: string; model: string; maxLoopIterations?: number; maxCostPerExecution?: number }
  createdAt: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

export interface Run {
  id: string
  type: 'agent' | 'workflow'
  targetId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
}

export interface MemoryEntry {
  id: string
  key: string
  value: unknown
  updatedAt: string
}

export interface APIKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  rateLimit: number
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
}

export interface OpenRoomsConfig {
  /** Your OpenRooms API key (sk_...) */
  apiKey: string
  /** Base URL of your OpenRooms API instance */
  baseUrl?: string
}

// ─── Core client ─────────────────────────────────────────────────────────────

class OpenRoomsClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(config: OpenRoomsConfig) {
    this.baseUrl = (config.baseUrl || 'https://api.openrooms.io').replace(/\/$/, '')
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api${path}`
    const res = await fetch(url, { ...init, headers: { ...this.headers, ...init?.headers } })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(`[OpenRooms] ${res.status} ${err.message || err.error || res.statusText}`)
    }

    if (res.status === 204) return undefined as T
    return res.json()
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────
  readonly rooms = {
    list: () => this.request<{ rooms: Room[] }>('/rooms'),

    get: (id: string) => this.request<Room>(`/rooms/${id}`),

    create: (data: { name: string; description?: string; workflowId?: string }) =>
      this.request<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),

    delete: (id: string) =>
      this.request<void>(`/rooms/${id}`, { method: 'DELETE' }),

    start: (id: string) =>
      this.request<{ status: string }>(`/rooms/${id}/run`, { method: 'POST', body: '{}' }),

    stop: (id: string) =>
      this.request<{ status: string }>(`/rooms/${id}/pause`, { method: 'POST', body: '{}' }),

    trigger: (id: string, payload: Record<string, unknown>) =>
      this.request<{ queued: boolean }>(`/rooms/${id}/webhook`, {
        method: 'POST',
        body: JSON.stringify({ type: 'user_trigger', payload }),
      }),

    /** Read all memory entries for a room */
    memory: {
      list: (roomId: string) =>
        this.request<{ entries: MemoryEntry[]; count: number }>(`/rooms/${roomId}/memory`),

      write: (roomId: string, key: string, value: unknown) =>
        this.request<{ key: string; value: unknown }>(`/rooms/${roomId}/memory`, {
          method: 'POST',
          body: JSON.stringify({ key, value }),
        }),

      delete: (roomId: string, key: string) =>
        this.request<void>(`/rooms/${roomId}/memory/${encodeURIComponent(key)}`, { method: 'DELETE' }),
    },
  }

  // ── Agents ────────────────────────────────────────────────────────────────
  readonly agents = {
    list: () => this.request<{ agents: Agent[]; count: number }>('/agents'),

    get: (id: string) => this.request<Agent>(`/agents/${id}`),

    deploy: (data: {
      name: string
      goal: string
      roomId: string
      allowedTools?: string[]
      policyConfig?: Partial<Agent['policyConfig']>
    }) =>
      this.request<Agent>('/agents', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          allowedTools: data.allowedTools ?? ['calculator', 'http_request', 'memory_query'],
          policyConfig: { provider: 'openai', model: 'gpt-4o', maxLoopIterations: 5, ...data.policyConfig },
        }),
      }),

    run: (id: string, input?: Record<string, unknown>) =>
      this.request<Run>(`/agents/${id}/run`, { method: 'POST', body: JSON.stringify(input ?? {}) }),

    traces: (id: string, limit = 50) =>
      this.request<{ traces: unknown[] }>(`/agents/${id}/traces?limit=${limit}`),
  }

  // ── Workflows ─────────────────────────────────────────────────────────────
  readonly workflows = {
    list: () => this.request<{ workflows: Workflow[] }>('/workflows'),

    get: (id: string) => this.request<Workflow>(`/workflows/${id}`),

    create: (data: { name: string; description?: string }) =>
      this.request<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(data) }),

    run: (id: string, payload?: Record<string, unknown>) =>
      this.request<Run>(`/workflows/${id}/run`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
  }

  // ── Runs ──────────────────────────────────────────────────────────────────
  readonly runs = {
    list: (params?: { type?: string; status?: string; limit?: number }) => {
      const q = new URLSearchParams()
      if (params?.type) q.set('type', params.type)
      if (params?.status) q.set('status', params.status)
      if (params?.limit) q.set('limit', String(params.limit))
      return this.request<{ runs: Run[]; count: number }>(`/runs?${q}`)
    },

    get: (id: string) => this.request<Run>(`/runs/${id}`),

    trace: (id: string) => this.request<{ run: Run; traces: unknown[]; count: number }>(`/runs/${id}/trace`),

    /** Stream SSE events for a run. Calls onEvent for each step until the run ends. */
    stream: (onEvent: (event: { type: string; data: unknown; timestamp: string }) => void): () => void => {
      const source = new EventSource(`${this.baseUrl}/api/runtime/events`, {})
      source.onmessage = (e) => {
        try { onEvent(JSON.parse(e.data)) } catch { /* malformed */ }
      }
      return () => source.close()
    },
  }

  // ── API Keys ──────────────────────────────────────────────────────────────
  readonly keys = {
    list: () => this.request<{ keys: APIKey[]; count: number }>('/api-keys'),

    create: (data: { name: string; scopes?: string[]; expiresIn?: number }) =>
      this.request<{ key: string; prefix: string; name: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ scopes: ['read', 'write'], ...data }),
      }),

    revoke: (id: string) => this.request<void>(`/api-keys/${id}`, { method: 'DELETE' }),
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { OpenRoomsClient as OpenRooms }
export default OpenRoomsClient

/**
 * Verify that a webhook payload came from OpenRooms.
 * Usage: app.post('/hook', (req) => { if (!verifyWebhook(req.headers['x-openrooms-sig'], req.body, secret)) return 401 })
 */
export function verifyWebhook(signature: string | undefined, payload: string, secret: string): boolean {
  if (!signature) return false
  const { createHmac } = require('crypto') // Node.js only
  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`
  return signature === expected
}
