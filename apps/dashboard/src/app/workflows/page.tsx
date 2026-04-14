'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { PlayIcon, PlusIcon, AlertCircleIcon } from '@/components/icons'
import { WorkflowIcon, AgentIcon, APIIcon, AutomationIcon, LiveRunsIcon, ObservabilityIcon } from '@/components/icons/system'
import { createWorkflow, getWorkflows, runWorkflow } from '@/lib/api'

const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'
const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'

interface Workflow {
  id: string
  name: string
  description?: string
  version: number
  status: string
  nodeCount?: number
  createdAt: string
  updatedAt: string
}

// ─── Snippets panel ───────────────────────────────────────────────────────────
function SnippetPanel({ workflow }: { workflow: Workflow }) {
  const [copied, setCopied] = useState<string | null>(null)
  const webhookUrl = `${API_BASE}/api/rooms/webhook`
  const curlTrigger = `curl -X POST "${API_BASE}/api/workflows/${workflow.id}/run" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"input": {"workflowId": "${workflow.id}"}}'`
  const webhookPayload = `// POST ${webhookUrl}
{
  "event": "custom.trigger",
  "workflowId": "${workflow.id}",
  "payload": {
    "source": "external",
    "data": { "key": "value" }
  }
}`

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[#E8E0D0] pt-4">
      {/* Webhook URL */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Webhook trigger URL</p>
        <div className="flex items-center gap-2 bg-[#0D0F1A] rounded-xl px-4 py-2.5">
          <code className="flex-1 font-mono text-[11px] text-[#6EE7B7] truncate">{`${API_BASE}/api/rooms/webhook`}</code>
          <button onClick={() => copy(webhookUrl, 'webhook')}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: copied === 'webhook' ? '#10B981' : '#1E2240', color: copied === 'webhook' ? '#fff' : '#aaa' }}>
            {copied === 'webhook' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* curl snippet */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Run via curl</p>
          <button onClick={() => copy(curlTrigger, 'curl')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: copied === 'curl' ? '#10B981' : '#1E2240', color: copied === 'curl' ? '#fff' : '#aaa' }}>
            {copied === 'curl' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-[#0D0F1A] rounded-xl p-4 font-mono text-[10.5px] text-[#FCA882] overflow-x-auto leading-relaxed">{curlTrigger}</pre>
      </div>

      {/* Webhook payload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Webhook payload example</p>
          <button onClick={() => copy(webhookPayload, 'payload')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: copied === 'payload' ? '#10B981' : '#1E2240', color: copied === 'payload' ? '#fff' : '#aaa' }}>
            {copied === 'payload' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-[#0D0F1A] rounded-xl p-4 font-mono text-[10.5px] text-[#93C5FD] overflow-x-auto leading-relaxed">{webhookPayload}</pre>
      </div>
    </div>
  )
}

// ─── Blueprint cards ──────────────────────────────────────────────────────────
const BLUEPRINTS = [
  {
    name: 'Sequential Pipeline',
    description: 'Agent executes steps in strict order — fetch → process → notify. Ideal for data transformation and ETL.',
    icon: WorkflowIcon,
    accent: '#93C5FD',
    snippet: `// Sequential workflow DSL
{
  "steps": [
    { "id": "fetch",   "type": "http_request", "url": "{{source_api}}" },
    { "id": "process", "type": "agent",        "goal": "Transform + validate data" },
    { "id": "notify",  "type": "http_request", "url": "{{output_api}}" }
  ]
}`,
    tags: ['ETL', 'Data', 'Automation'],
  },
  {
    name: 'Parallel Fan-out',
    description: 'Dispatch work to multiple agents simultaneously. All branches write to shared Room memory, then converge.',
    icon: AutomationIcon,
    accent: '#6EE7B7',
    snippet: `// Fan-out workflow — branches run in parallel
{
  "parallel": [
    { "agent": "researcher-a", "topic": "market-signals" },
    { "agent": "researcher-b", "topic": "sentiment" },
    { "agent": "researcher-c", "topic": "competitors" }
  ],
  "converge": { "agent": "synthesiser" }
}`,
    tags: ['Swarm', 'Research', 'Parallel'],
  },
  {
    name: 'Agent Decision Tree',
    description: 'LLM-powered conditional branching. The agent reasons at each node and picks the next path dynamically.',
    icon: AgentIcon,
    accent: '#C4B5FD',
    snippet: `// Decision node — agent output selects branch
{
  "node": "triage",
  "type": "agent_decision",
  "choices": [
    { "if": "output.severity == 'high'",   "goto": "escalate" },
    { "if": "output.severity == 'medium'", "goto": "monitor" },
    { "else": true,                         "goto": "resolve" }
  ]
}`,
    tags: ['AI', 'Conditional', 'Routing'],
  },
  {
    name: 'API Integration Chain',
    description: 'Register REST APIs as agent tools. Agents call them by name, handle retries, parse responses automatically.',
    icon: APIIcon,
    accent: '#FDBA74',
    snippet: `// Register API → agent uses it as a tool
POST /api/tools/create
{
  "name":    "send_alert",
  "type":    "REST_API",
  "baseUrl": "https://api.your-service.com",
  "method":  "POST",
  "path":    "/v1/alerts"
}
// Agent goal: "Call send_alert when anomaly detected"`,
    tags: ['REST', 'Integration', 'Tools'],
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [lastRunId, setLastRunId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedBlueprint, setExpandedBlueprint] = useState<number | null>(null)
  const [copiedBlueprint, setCopiedBlueprint] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function loadWorkflows() {
    try {
      const data = await getWorkflows()
      setWorkflows(data.workflows || [])
    } catch {
      // silently retry
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
    pollRef.current = setInterval(loadWorkflows, 6000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function handleCreateWorkflow(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!form.name.trim()) { setCreateError('Workflow name is required'); return }
    setCreateError(null)
    setCreating(true)
    try {
      const wf = await createWorkflow({ name: form.name.trim(), description: form.description.trim() || undefined })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      await loadWorkflows()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setExpandedId((wf as any)?.workflow?.id || null)
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create workflow')
    } finally {
      setCreating(false)
    }
  }

  async function handleRunWorkflow(workflowId: string) {
    setRunningId(workflowId)
    setRunError(null)
    try {
      const result = await runWorkflow(workflowId)
      setLastRunId(result.runId)
    } catch (err: any) {
      setRunError(err.message || 'Failed to run workflow')
    } finally {
      setRunningId(null)
    }
  }

  async function deployBlueprint(bp: typeof BLUEPRINTS[0]) {
    setCreating(true)
    try {
      await createWorkflow({ name: `${bp.name}`, description: bp.description })
      await loadWorkflows()
    } catch {
      // silent — show in workflow list
    } finally {
      setCreating(false)
    }
  }

  const statusCounts = {
    all: workflows.length,
    ACTIVE: workflows.filter(w => w.status === 'ACTIVE').length,
    DRAFT: workflows.filter(w => w.status === 'DRAFT').length,
    DEPRECATED: workflows.filter(w => w.status === 'DEPRECATED').length,
  }

  const filteredWorkflows = filter === 'all' ? workflows : workflows.filter(w => w.status === filter)

  function copyBlueprint(idx: number, snippet: string) {
    navigator.clipboard.writeText(snippet)
    setCopiedBlueprint(idx)
    setTimeout(() => setCopiedBlueprint(null), 2000)
  }

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E8E0D0] bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <WorkflowIcon className="w-10 h-10 flex-shrink-0 transition-transform hover:scale-105 duration-200" />
          <div>
            <h1 className="text-xl font-extrabold text-[#111]">Workflows</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {workflows.length} orchestration graph{workflows.length !== 1 ? 's' : ''} — observe, configure, trigger
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono border border-[#E8E0D0] rounded-lg px-2.5 py-1.5 bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live polling
          </span>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all"
            style={{ backgroundColor: CTA }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
            <PlusIcon className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Banners */}
      {lastRunId && (
        <div className="mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-800">
            ✓ Workflow triggered — Run ID: <code className="font-mono text-xs bg-emerald-100 px-1 py-0.5 rounded">{lastRunId}</code>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/live-runs" className="text-xs font-bold text-emerald-700 hover:underline">View live →</Link>
            <button onClick={() => setLastRunId(null)} className="text-emerald-500 text-xs">✕</button>
          </div>
        </div>
      )}
      {runError && (
        <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-red-800">{runError}</span>
          <button onClick={() => setRunError(null)} className="text-red-400 text-xs">✕</button>
        </div>
      )}

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Create form */}
          {showCreate && (
            <div className="bg-white border border-[#DDD5C8] rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-[#111] mb-4">Create workflow</h2>
              <form className="space-y-4" onSubmit={handleCreateWorkflow}>
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />{createError}
                  </div>
                )}
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Workflow name" className="w-full px-4 py-3 border border-[#DDD5C8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional — explain what this workflow does)" rows={2}
                  className="w-full px-4 py-3 border border-[#DDD5C8] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#EA580C]" />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="px-4 py-2.5 border border-[#DDD5C8] rounded-xl text-sm font-bold text-[#111] hover:border-[#111] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                    style={{ backgroundColor: CTA }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
                    {creating ? 'Creating…' : 'Create Workflow'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Runtime Blueprints ─────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#111]">Runtime Blueprints</h2>
                <p className="text-xs text-gray-400 mt-0.5">Pre-built orchestration patterns with code snippets — click to expand, copy, or deploy.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BLUEPRINTS.map((bp, idx) => {
                const Icon = bp.icon
                const isExpanded = expandedBlueprint === idx
                return (
                  <div key={idx} className="bg-white border border-[#E8E0D0] rounded-2xl overflow-hidden transition-all duration-200"
                    style={{ borderColor: isExpanded ? bp.accent : '' }}>
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: bp.accent + '25', border: `1.5px solid ${bp.accent}` }}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-[#111]">{bp.name}</h3>
                            {bp.tags.map(t => (
                              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EAE0] text-gray-500">{t}</span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-snug">{bp.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedBlueprint(isExpanded ? null : idx)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold border border-[#E8E0D0] hover:border-[#111] transition-colors text-[#111]">
                          {isExpanded ? 'Hide snippet ↑' : 'View snippet ↓'}
                        </button>
                        <button onClick={() => copyBlueprint(idx, bp.snippet)}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{ background: copiedBlueprint === idx ? '#10B981' : '#F0EAE0', color: copiedBlueprint === idx ? '#fff' : '#555' }}>
                          {copiedBlueprint === idx ? '✓ Copied' : 'Copy'}
                        </button>
                        <button onClick={() => deployBlueprint(bp)} disabled={creating}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                          style={{ backgroundColor: CTA }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
                          Deploy
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <pre className="bg-[#0D0F1A] px-5 py-4 font-mono text-[10.5px] text-[#93C5FD] overflow-x-auto leading-relaxed border-t border-[#1A1D2E]">{bp.snippet}</pre>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Your Workflows ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#111]">Your Workflows</h2>
              <div className="flex items-center gap-1 border-b border-[#E8E0D0]">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button key={status} onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors border-b-2 ${
                      filter === status ? 'border-[#EA580C] text-[#111]' : 'border-transparent text-gray-400 hover:text-[#111]'
                    }`}>
                    {status.charAt(0) + status.slice(1).toLowerCase()} <span className="ml-1 text-gray-400">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#E8E0D0] border-t-[#EA580C] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading workflows…</p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="border-2 border-dashed border-[#D4C4A8] rounded-2xl bg-white py-14 text-center">
                <WorkflowIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-base font-extrabold text-[#111] mb-2">No workflows yet</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Deploy a blueprint above, or create a custom workflow to orchestrate agents and APIs.</p>
                <button onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all"
                  style={{ backgroundColor: CTA }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
                  New Workflow
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map(workflow => {
                  const isExpanded = expandedId === workflow.id
                  return (
                    <div key={workflow.id} className="bg-white border border-[#E8E0D0] rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ borderColor: isExpanded ? '#EA580C' : '' }}>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 bg-[#F9F5EF] rounded-xl flex items-center justify-center flex-shrink-0">
                              <WorkflowIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <h3 className="font-extrabold text-sm text-[#111] truncate">{workflow.name}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  workflow.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                  workflow.status === 'DRAFT'  ? 'bg-gray-100 text-gray-600' :
                                  'bg-red-100 text-red-600'
                                }`}>{workflow.status}</span>
                              </div>
                              {workflow.description && (
                                <p className="text-xs text-gray-400 truncate">{workflow.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                                <span>v{workflow.version}</span>
                                {workflow.nodeCount && <span>{workflow.nodeCount} nodes</span>}
                                <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Observe — expands snippet/webhook */}
                            <button onClick={() => setExpandedId(isExpanded ? null : workflow.id)}
                              className="px-3 py-2 border border-[#E8E0D0] hover:border-[#111] rounded-xl text-[11px] font-bold text-[#111] transition-colors flex items-center gap-1.5">
                              <ObservabilityIcon className="w-4 h-4" />
                              {isExpanded ? 'Close' : 'Trigger'}
                            </button>
                            {/* Run */}
                            <button onClick={() => handleRunWorkflow(workflow.id)} disabled={runningId === workflow.id}
                              className="px-3 py-2 text-white text-[11px] font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                              style={{ backgroundColor: CTA }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
                              <PlayIcon className="w-3.5 h-3.5" />
                              {runningId === workflow.id ? 'Starting…' : 'Run'}
                            </button>
                            {/* Open in Room */}
                            <Link href={`/rooms?action=create&workflowId=${workflow.id}`}
                              className="px-3 py-2 border border-[#E8E0D0] hover:border-[#111] text-[#111] text-[11px] font-bold rounded-xl transition-colors">
                              + Room
                            </Link>
                          </div>
                        </div>

                        {/* Expanded: snippet panel */}
                        {isExpanded && <SnippetPanel workflow={workflow} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Infrastructure context ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                Icon: LiveRunsIcon, title: 'Execution engine', color: '#6EE7B7',
                desc: 'BullMQ + Redis job queue. Every workflow run is queued, retried, and streamed live.',
                link: '/live-runs', cta: 'View live runs',
              },
              {
                Icon: ObservabilityIcon, title: 'Full observability', color: '#C4B5FD',
                desc: 'Every agent step, tool call, and decision is logged to PostgreSQL and traceable.',
                link: '/runtime', cta: 'Open runtime',
              },
              {
                Icon: APIIcon, title: 'API-first triggers', color: '#FDBA74',
                desc: 'Trigger any workflow from a REST call, webhook, or schedule. No SDK needed.',
                link: '/connectors', cta: 'Add connector',
              },
            ].map(({ Icon, title, color, desc, link, cta }) => (
              <div key={title} className="bg-white border border-[#E8E0D0] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '25', border: `1.5px solid ${color}` }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#111]">{title}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{desc}</p>
                <Link href={link} className="text-xs font-bold text-[#EA580C] hover:underline">{cta} →</Link>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
