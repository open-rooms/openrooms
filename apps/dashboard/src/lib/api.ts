const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined && options?.body !== null
  const defaultHeaders = hasBody ? { 'Content-Type': 'application/json' } : {}
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...defaultHeaders, ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Health
export const getHealth = () => request<{ status: string; redis: string; database: string; timestamp: string }>('/api/health')

// Rooms
export const getRooms = () => request<{ rooms: Room[] }>('/api/rooms')
export const getRoom = (id: string) => request<Room>(`/api/rooms/${id}`)
export const createRoom = (data: CreateRoomInput) => request<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(data) })
export const deleteRoom = (id: string) => request<void>(`/api/rooms/${id}`, { method: 'DELETE' })
export const runRoom = (id: string) => request<{ executionId: string }>(`/api/rooms/${id}/run`, { method: 'POST' })
export const pauseRoom = (id: string) => request<void>(`/api/rooms/${id}/pause`, { method: 'POST' })
export const resumeRoom = (id: string) => request<void>(`/api/rooms/${id}/resume`, { method: 'POST' })
export const getRoomLogs = (id: string) => request<{ logs: ExecutionLog[] }>(`/api/rooms/${id}/logs`)

// Workflows
export const getWorkflows = () => request<{ workflows: Workflow[] }>('/api/workflows')
export const getWorkflow = (id: string) => request<Workflow>(`/api/workflows/${id}`)
export const createWorkflow = (data: CreateWorkflowInput) =>
  request<Workflow>('/api/workflows', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      initialNodeId: data.initialNodeId,
    }),
  })
export const deleteWorkflow = (id: string) => request<void>(`/api/workflows/${id}`, { method: 'DELETE' })
export const getWorkflowNodes = (id: string) => request<{ nodes: WorkflowNode[] }>(`/api/workflows/${id}/nodes`)

// Tools
export const getTools = () => request<{ tools: Tool[] }>('/api/tools')
export const getTool = (id: string) => request<Tool>(`/api/tools/${id}`)

// Agents
export const getAgents = () => request<{ agents: Agent[]; count: number }>('/api/agents')
export const getAgent = (id: string) => request<Agent>(`/api/agents/${id}`)
export const createAgent = (data: CreateAgentInput) => request<Agent>('/api/agents', { method: 'POST', body: JSON.stringify(data) })
export const updateAgent = (id: string, data: Partial<Agent>) => request<Agent>(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteAgent = (id: string) => request<void>(`/api/agents/${id}`, { method: 'DELETE' })
export const executeAgent = (id: string, data: { roomId: string; maxIterations?: number }) =>
  request<{ executionId: string; message: string }>(`/api/agents/${id}/execute`, { method: 'POST', body: JSON.stringify(data) })
export const getAgentTraces = (id: string, limit = 50) => request<{ traces: AgentTrace[] }>(`/api/agents/${id}/traces?limit=${limit}`)

// Settings
export const getProviderSettings = () => request<{
  providers: {
    openai: { configured: boolean; keyPreview: string | null; keySource: string; model: string; availableModels: string[] };
    anthropic: { configured: boolean; keyPreview: string | null; keySource: string; model: string; availableModels: string[] };
  };
  defaultProvider: string;
}>('/api/settings/providers')

export const saveProviderSettings = (data: {
  openai?: { apiKey?: string; model?: string };
  anthropic?: { apiKey?: string; model?: string };
  defaultProvider?: string;
}) => request<{ success: boolean; message: string }>('/api/settings/providers', {
  method: 'PUT',
  body: JSON.stringify(data),
})

export const getPlatformStatus = () => request<{ agents: number; workflows: number; tools: number; runs: number }>('/api/settings/status')

// Runs — Stage 4
export const getRuns = (params?: { type?: string; targetId?: string; status?: string; limit?: number }) => {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.targetId) qs.set('targetId', params.targetId)
  if (params?.status) qs.set('status', params.status)
  if (params?.limit) qs.set('limit', String(params.limit))
  return request<{ runs: Run[]; count: number }>(`/api/runs${qs.toString() ? `?${qs}` : ''}`)
}
export const getRun = (id: string) => request<Run>(`/api/runs/${id}`)
export const getLogsByRun = (runId: string) => request<{ logs: ExecutionLog[]; runId: string; count: number }>(`/api/logs/${runId}`)

export const runAgent = (agentId: string, data?: { roomId?: string; maxIterations?: number; goal?: string }) =>
  request<{ runId: string; agentId: string; status: string; message: string }>(
    `/api/agents/${agentId}/run`,
    { method: 'POST', body: JSON.stringify(data ?? {}) }
  )

export const runWorkflow = (workflowId: string, data?: { roomId?: string; roomName?: string; context?: Record<string, unknown> }) =>
  request<{ runId: string; workflowId: string; roomId: string; status: string; message: string }>(
    `/api/workflows/${workflowId}/run`,
    { method: 'POST', body: JSON.stringify(data ?? {}) }
  )

// API Keys
export const getAPIKeys = () => request<{ keys: APIKey[] }>('/api/api-keys')
export const createAPIKey = (data: CreateAPIKeyInput) => request<{ key: string; id: string }>('/api/api-keys', { method: 'POST', body: JSON.stringify(data) })
export const deleteAPIKey = (id: string) => request<void>(`/api/api-keys/${id}`, { method: 'DELETE' })
export const getAPIKeyUsage = (id: string) => request<{ usage: APIKeyUsage[] }>(`/api/api-keys/${id}/usage`)

// ---- Types ----

export interface Room {
  id: string
  name: string
  description?: string
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  workflowId: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
}

export interface CreateRoomInput {
  name: string
  description?: string
  workflowId: string
  config?: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  description?: string
  version: number
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED'
  initialNodeId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowInput {
  name: string
  description?: string
  initialNodeId?: string
  nodes?: WorkflowNodeInput[]
}

export interface WorkflowNode {
  id: string
  workflowId: string
  nodeId: string
  type: string
  name: string
  description?: string
  config: Record<string, unknown>
}

export interface WorkflowNodeInput {
  nodeId: string
  type: string
  name: string
  config?: Record<string, unknown>
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  version: string
  parameters: unknown[]
  timeout: number
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  goal: string
  version: number
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  loopState: string
  allowedTools: string[]
  policyConfig: Record<string, unknown>
  memoryState: Record<string, unknown>
  roomId?: string
  createdAt: string
  updatedAt: string
  lastExecutedAt?: string
}

export interface CreateAgentInput {
  name: string
  description?: string
  goal: string
  roomId?: string
  allowedTools: string[]
  policyConfig?: {
    maxLoopIterations?: number
    maxTokensPerRequest?: number
    maxCostPerExecution?: number
    deniedTools?: string[]
  }
}

export interface AgentTrace {
  id: string
  loopIteration: number
  loopState: string
  modelPrompt?: string
  modelResponse?: string
  selectedTool?: string
  toolRationale?: string
  toolInput?: unknown
  toolOutput?: unknown
  durationMs?: number
  timestamp: string
}

export interface ExecutionLog {
  id: string
  roomId: string
  workflowId: string
  eventType: string
  level: string
  message: string
  data: Record<string, unknown>
  timestamp: string
  duration?: number
}

export interface APIKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  rateLimit: number
  rateLimitWindow: number
  isActive: boolean
  expiresAt?: string
  lastUsedAt?: string
  createdAt: string
}

export interface CreateAPIKeyInput {
  name: string
  scopes: string[]
  rateLimit?: number
  rateLimitWindow?: number
  expiresIn?: number
}

export interface APIKeyUsage {
  id: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: string
}

export interface Run {
  id: string
  type: 'agent' | 'workflow'
  targetId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: Record<string, unknown>
  output?: Record<string, unknown> | null
  error?: string | null
  roomId?: string | null
  startedAt?: string | null
  endedAt?: string | null
  createdAt: string
  updatedAt: string
}

// Namespace alias for legacy imports: `import { api } from '@/lib/api'`
export const api = {
  getRooms,
  getRoom,
  createRoom,
  deleteRoom,
  runRoom,
  pauseRoom,
  resumeRoom,
  getRoomLogs,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  deleteWorkflow,
  getWorkflowNodes,
  getTools,
  getTool,
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  executeAgent,
  getAgentTraces,
  getAPIKeys,
  createAPIKey,
  deleteAPIKey,
  getAPIKeyUsage,
  getHealth,
  getRuns,
  getRun,
  getLogsByRun,
  runAgent,
  runWorkflow,
}
