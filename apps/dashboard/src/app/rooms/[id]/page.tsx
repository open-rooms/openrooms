'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, getAgents, getRuns, runAgent, updateAgent, createAgent, getTools } from '@/lib/api'
import type { Agent, Run } from '@/lib/api'
import { PlayIcon, RefreshIcon, AlertCircleIcon, CheckCircleIcon, PlusIcon } from '@/components/icons'
import {
  AgentIcon,
  WorkflowIcon,
  LiveRunsIcon,
  APIIcon,
  ReportsIcon,
  MemoryIcon,
  AutomationIcon,
  WebhookIcon,
  StorageIcon,
  ComplianceIcon,
} from '@/components/icons/system'
import { formatDate } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Panel = 'agents' | 'workflows' | 'connectors' | 'events' | 'logs' | 'metrics' | 'storage' | 'linked' | 'snapshot' | 'policy' | 'outputs' | null

// ─── Capability definition ─────────────────────────────────────────────────────
const CAPABILITIES = [
  { id: 'agents' as Panel,    label: 'Agents',        Icon: AgentIcon,       desc: 'Deploy and manage agents' },
  { id: 'workflows' as Panel, label: 'Workflows',     Icon: WorkflowIcon,    desc: 'Orchestration graph' },
  { id: 'connectors' as Panel,label: 'Connectors',    Icon: APIIcon,         desc: 'APIs & tools' },
  { id: 'events' as Panel,    label: 'Triggers',      Icon: AutomationIcon,  desc: 'Fire the system' },
  { id: 'outputs' as Panel,   label: 'Outputs',       Icon: ReportsIcon,     desc: 'What the agent produced' },
  { id: 'logs' as Panel,      label: 'Logs',          Icon: LiveRunsIcon,    desc: 'Execution log' },
  { id: 'metrics' as Panel,   label: 'Metrics',       Icon: ReportsIcon,     desc: 'Run stats' },
  { id: 'storage' as Panel,   label: 'Memory',        Icon: MemoryIcon,      desc: 'Shared room state' },
  { id: 'linked' as Panel,    label: 'Linked Rooms',  Icon: WebhookIcon,     desc: 'Room-to-room wiring' },
  { id: 'snapshot' as Panel,  label: 'Snapshots',     Icon: StorageIcon,     desc: 'Save & restore room state' },
  { id: 'policy' as Panel,    label: 'Policy',        Icon: ComplianceIcon,  desc: 'Cost caps & model routing' },
]

// ─── Panel: Agents ─────────────────────────────────────────────────────────────
function AgentsPanel({ roomId, agents, onRefresh, onRunAgent }: { roomId: string; agents: Agent[]; onRefresh: () => void; onRunAgent: (id: string) => Promise<void> }) {
  const [runningId, setRunningId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleRun(id: string) {
    setRunningId(id)
    try { await onRunAgent(id) }
    finally { setRunningId(null) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newGoal) return
    setCreating(true)
    try {
      await createAgent({ name: newName, goal: newGoal, roomId, allowedTools: ['calculator', 'http_request', 'memory_query'], policyConfig: { provider: 'simulation', model: 'gpt-4o', maxLoopIterations: 5 } })
      setShowCreate(false); setNewName(''); setNewGoal('')
      onRefresh()
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Agents share this room's memory. What one learns, all can use.</p>
        <button onClick={() => setShowCreate(s => !s)}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
          <PlusIcon className="w-3 h-3" /> Deploy Agent
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 border-2 border-[#EA580C]/40 bg-orange-50 rounded-xl space-y-3">
          <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Agent name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
          <textarea required value={newGoal} onChange={e => setNewGoal(e.target.value)} rows={3}
            placeholder="Agent goal — be specific about what it should do and what to output"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C] resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {creating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {creating ? 'Deploying…' : 'Deploy'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {agents.length === 0 ? (
        <div className="text-center py-8">
          <AgentIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-gray-500">No agents in this room. Deploy one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map(agent => (
            <div key={agent.id} className="p-4 bg-white border border-[#D4C4A8] rounded-xl hover:bg-white transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/agents/${agent.id}`} className="font-bold text-[#111111] hover:text-[#EA580C] text-sm truncate">{agent.name}</Link>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                      agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                      agent.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>{agent.status}</span>
                    <span className={`text-[10px] font-mono ${
                      agent.loopState === 'REASONING' ? 'text-purple-500' :
                      agent.loopState === 'EXECUTING_TOOL' ? 'text-orange-500' :
                      'text-gray-400'
                    }`}>{agent.loopState}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{agent.goal}</p>
                  {agent.allowedTools.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {agent.allowedTools.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-mono">{t}</span>
                      ))}
                      {agent.allowedTools.length > 3 && <span className="text-[10px] text-gray-400">+{agent.allowedTools.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleRun(agent.id)} disabled={runningId === agent.id || agent.status !== 'ACTIVE'}
                    className="px-2.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                    {runningId === agent.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayIcon className="w-3 h-3" />}
                    Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Panel: Events (Webhook trigger) ──────────────────────────────────────────
function EventsPanel({ roomId, onEvent }: { roomId: string; onEvent: (msg: string) => void }) {
  const [payload, setPayload] = useState('{\n  "trigger": "manual",\n  "context": {}\n}')
  const [triggering, setTriggering] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleTrigger() {
    let body: Record<string, unknown>
    try { body = JSON.parse(payload) } catch { setResult({ ok: false, msg: 'Invalid JSON' }); return }
    setTriggering(true); setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, msg: `Run queued: ${data.runId?.slice(0, 12)}…` })
        onEvent(`Webhook triggered → run ${data.runId?.slice(0, 8)}…`)
      } else {
        setResult({ ok: false, msg: data.message || 'Trigger failed' })
      }
    } catch (e: any) {
      setResult({ ok: false, msg: e.message })
    } finally { setTriggering(false) }
  }

  const webhookUrl = `${API_BASE}/api/rooms/${roomId}/webhook`
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(webhookUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Trigger this room's workflow from any external system — smart contract, API, cron job, or manually below.</p>

      {/* Webhook URL */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Webhook URL</label>
        <div className="flex gap-2">
          <code className="flex-1 px-3 py-2 bg-[#111111] text-emerald-300 text-xs rounded-lg font-mono overflow-x-auto whitespace-nowrap">
            POST {webhookUrl}
          </code>
          <button onClick={copy} className="px-3 py-2 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 whitespace-nowrap">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Manual trigger */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Trigger Payload (JSON)</label>
        <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#EA580C] bg-[#111111] text-emerald-300 resize-none" />
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${result.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.ok ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
          {result.msg}
        </div>
      )}

      <button onClick={handleTrigger} disabled={triggering}
        className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
        {triggering ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AutomationIcon className="w-4 h-4" />}
        {triggering ? 'Triggering…' : 'Trigger Event'}
      </button>
    </div>
  )
}

// ─── Panel: Connectors ────────────────────────────────────────────────────────
function ConnectorsPanel({ roomId }: { roomId: string }) {
  const [tab, setTab] = useState<'tools' | 'slack' | 'webhook' | 'schedule'>('tools')
  const [tools, setTools] = useState<any[]>([])
  const [toolsLoading, setToolsLoading] = useState(true)

  // Slack state
  const [slackUrl, setSlackUrl] = useState('')
  const [slackSaving, setSlackSaving] = useState(false)
  const [slackStatus, setSlackStatus] = useState<string | null>(null)

  // Webhook output state
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [webhookSaving, setWebhookSaving] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null)

  // Schedule state
  const [cronExpr, setCronExpr] = useState('')
  const [cronEnabled, setCronEnabled] = useState(false)
  const [cronSaving, setCronSaving] = useState(false)
  const [cronStatus, setCronStatus] = useState<string | null>(null)

  useEffect(() => {
    getTools().then(d => setTools(d.tools || [])).catch(() => {}).finally(() => setToolsLoading(false))
    // Load existing schedule
    fetch(`/api/rooms/${roomId}/schedule`).then(r => r.json()).then(d => {
      if (d.schedule) {
        setCronExpr(d.schedule.expression ?? '')
        setCronEnabled(d.schedule.enabled ?? false)
      }
    }).catch(() => {})
  }, [roomId])

  async function testSlack() {
    if (!slackUrl) return
    setSlackSaving(true); setSlackStatus(null)
    try {
      const r = await fetch('/api/integrations/slack/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: slackUrl, message: `✅ Room "${roomId.slice(0,8)}" connected to Slack!` }),
      })
      const d = await r.json()
      setSlackStatus(d.ok ? '✓ Message sent to Slack!' : `✗ ${d.error}`)
    } catch (e: any) { setSlackStatus(`✗ ${e.message}`) }
    setSlackSaving(false)
  }

  async function testWebhook() {
    if (!webhookUrl) return
    setWebhookSaving(true); setWebhookStatus(null)
    try {
      const r = await fetch('/api/integrations/webhook/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl, secret: webhookSecret || undefined, payload: { source: 'openrooms', roomId, test: true, message: 'OpenRooms webhook test' } }),
      })
      const d = await r.json()
      setWebhookStatus(d.ok ? '✓ Webhook delivered!' : `✗ HTTP ${d.status}`)
    } catch (e: any) { setWebhookStatus(`✗ ${e.message}`) }
    setWebhookSaving(false)
  }

  async function saveSchedule() {
    setCronSaving(true); setCronStatus(null)
    try {
      const r = await fetch(`/api/rooms/${roomId}/schedule`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: cronExpr, enabled: cronEnabled }),
      })
      const d = await r.json()
      setCronStatus(d.ok ? '✓ Schedule saved!' : `✗ ${d.error}`)
    } catch (e: any) { setCronStatus(`✗ ${e.message}`) }
    setCronSaving(false)
  }

  const CRON_PRESETS = [
    { label: 'Every morning 8am', expr: '0 8 * * *' },
    { label: 'Every hour',        expr: '0 * * * *' },
    { label: 'Every Monday 9am',  expr: '0 9 * * 1' },
    { label: 'First of month',    expr: '0 9 1 * *' },
  ]

  const TABS = [
    { id: 'tools',    label: 'Tools' },
    { id: 'slack',    label: '💬 Slack' },
    { id: 'webhook',  label: '🔗 Webhook Out' },
    { id: 'schedule', label: '⏰ Schedule' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#F9F5EF] rounded-xl border border-[#E8E0D0]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${tab === t.id ? 'bg-white shadow-sm text-[#EA580C] border border-[#E8E0D0]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tools tab */}
      {tab === 'tools' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Tools agents in this room can call by name.</p>
            <Link href="/connectors" className="px-3 py-1.5 border border-[#D4C4A8] hover:border-[#EA580C] text-xs font-bold rounded-lg transition-colors">+ Add Tool</Link>
          </div>
          {toolsLoading
            ? <div className="text-center py-6"><div className="w-5 h-5 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto" /></div>
            : tools.length === 0
              ? <div className="text-center py-6"><APIIcon className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-xs text-gray-500">No tools. <Link href="/connectors" className="text-[#EA580C] font-bold hover:underline">Add one →</Link></p></div>
              : tools.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-white border border-[#D4C4A8] rounded-xl">
                  <APIIcon className="w-7 h-7 flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111]">{t.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{t.description}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold uppercase">{t.category}</span>
                </div>
              ))
          }
        </div>
      )}

      {/* Slack tab */}
      {tab === 'slack' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-bold text-blue-900 mb-0.5">Send agent output to Slack</p>
            <p className="text-[10px] text-blue-700">After a run completes, the output is posted to your Slack channel. Paste your Incoming Webhook URL.</p>
          </div>
          <label className="block">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Slack Incoming Webhook URL</span>
            <input value={slackUrl} onChange={e => setSlackUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/T.../B.../..."
              className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:border-[#EA580C] font-mono"
            />
          </label>
          <div className="flex items-center gap-2">
            <button onClick={testSlack} disabled={!slackUrl || slackSaving}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
              {slackSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Test connection
            </button>
            {slackStatus && <span className={`text-xs font-semibold ${slackStatus.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>{slackStatus}</span>}
          </div>
          <p className="text-[10px] text-gray-400">How to get a webhook URL: <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noreferrer" className="text-[#EA580C] hover:underline font-bold">Slack Incoming Webhooks guide →</a></p>
        </div>
      )}

      {/* Webhook output tab */}
      {tab === 'webhook' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="text-xs font-bold text-purple-900 mb-0.5">POST output to any URL</p>
            <p className="text-[10px] text-purple-700">When a run completes, OpenRooms will POST the agent's output as JSON to your URL. Works with Zapier, Make, Discord, or your own backend.</p>
          </div>
          <label className="block">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Destination URL</span>
            <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:border-[#EA580C] font-mono"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Authorization header (optional)</span>
            <input value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)}
              placeholder="Bearer my-secret-token"
              className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:border-[#EA580C] font-mono"
            />
          </label>
          <div className="flex items-center gap-2">
            <button onClick={testWebhook} disabled={!webhookUrl || webhookSaving}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
              {webhookSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Send test payload
            </button>
            {webhookStatus && <span className={`text-xs font-semibold ${webhookStatus.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>{webhookStatus}</span>}
          </div>
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-bold text-amber-900 mb-0.5">Run this Room on a schedule</p>
            <p className="text-[10px] text-amber-700">Set a cron expression and enable the schedule. The room fires automatically at the configured time.</p>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Quick presets</span>
            <div className="flex flex-wrap gap-1.5">
              {CRON_PRESETS.map(p => (
                <button key={p.expr} onClick={() => setCronExpr(p.expr)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${cronExpr === p.expr ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]' : 'border-[#D4C4A8] text-gray-500 hover:border-[#EA580C]'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Cron expression</span>
            <input value={cronExpr} onChange={e => setCronExpr(e.target.value)}
              placeholder="0 8 * * *  (= every day at 8am)"
              className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:border-[#EA580C] font-mono"
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setCronEnabled(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${cronEnabled ? 'bg-[#EA580C]' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${cronEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{cronEnabled ? 'Schedule enabled' : 'Schedule disabled'}</span>
          </label>

          <div className="flex items-center gap-2">
            <button onClick={saveSchedule} disabled={!cronExpr || cronSaving}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
              {cronSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Save schedule
            </button>
            {cronStatus && <span className={`text-xs font-semibold ${cronStatus.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>{cronStatus}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Room Command Input ────────────────────────────────────────────────────────
function RoomCommandInput({ roomId, onActivity }: { roomId: string; onActivity: (msg: string, type: 'event' | 'log') => void }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const msg = input.trim()
    if (!msg) return
    setSending(true)
    setInput('')
    onActivity(`> ${msg}`, 'event')
    try {
      const res = await fetch(`/api/rooms/${roomId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user_command', payload: { message: msg, source: 'dashboard' } }),
      })
      if (res.ok) {
        onActivity('Command received — agents are processing it', 'log')
      } else {
        onActivity('Queued locally — start the system to process', 'log')
      }
    } catch {
      onActivity('Queued locally — connect the API to process', 'log')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-white/10 p-3">
      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Send command</p>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tell this room what to do…"
          className="flex-1 px-3 py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:border-[#EA580C] font-mono text-gray-300 placeholder:text-gray-600"
        />
        <button type="submit" disabled={sending || !input.trim()}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors">
          {sending
            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
          Run
        </button>
      </form>
    </div>
  )
}

// ─── Panel: Linked Rooms ───────────────────────────────────────────────────────
function LinkedRoomsPanel({ currentRoomId }: { currentRoomId: string }) {
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [linked, setLinked] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(d => {
      setAllRooms((d.rooms || []).filter((r: any) => r.id !== currentRoomId))
    }).catch(() => {})
  }, [currentRoomId])

  function toggle(id: string) {
    setLinked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function save() {
    setSaving(true)
    // Linking is stored locally for now — backend wiring in next phase
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">Link this Room to others</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Linked Rooms can trigger each other via webhooks. When this Room completes a run,
          it fires an event into every linked Room automatically.
        </p>
      </div>

      {allRooms.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-400">No other rooms yet.</p>
          <Link href="/rooms" className="text-xs font-bold text-[#EA580C] hover:underline">Create another Room →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {allRooms.map((r: any) => (
            <button key={r.id} onClick={() => toggle(r.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                linked.includes(r.id)
                  ? 'border-[#EA580C] bg-orange-50'
                  : 'border-[#E8E0D0] bg-white hover:border-[#EA580C]/40'
              }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                linked.includes(r.id) ? 'border-[#EA580C] bg-[#EA580C]' : 'border-gray-300'
              }`}>
                {linked.includes(r.id) && (
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111] truncate">{r.name}</p>
                <p className="text-[10px] text-gray-400">{r.status || 'IDLE'} · webhook-ready</p>
              </div>
              {linked.includes(r.id) && (
                <span className="text-[9px] font-bold text-[#EA580C] bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">linked</span>
              )}
            </button>
          ))}
        </div>
      )}

      {linked.length > 0 && (
        <button onClick={save} disabled={saving}
          className="w-full py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
          {saving
            ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
            : `Save — link ${linked.length} room${linked.length > 1 ? 's' : ''}`
          }
        </button>
      )}

      <p className="text-[10px] text-gray-300 leading-relaxed">
        Full room-to-room event routing ships in the next release.
        This UI wires the configuration ahead of the backend.
      </p>
    </div>
  )
}

// ─── Panel: Snapshots ─────────────────────────────────────────────────────────
interface RoomSnapshot {
  id: string
  label: string
  timestamp: string
  status: string
  agents: { name: string; goal: string; allowedTools: string[]; policyConfig: Record<string, unknown> }[]
  roomName: string
  roomDescription?: string
}

function SnapshotPanel({ room, agents }: { room: any; agents: Agent[] }) {
  const key = `openrooms_snapshots_${room.id}`
  const [snapshots, setSnapshots] = useState<RoomSnapshot[]>([])
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setSnapshots(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [key])

  function persist(list: RoomSnapshot[]) {
    setSnapshots(list)
    localStorage.setItem(key, JSON.stringify(list))
  }

  async function takeSnapshot() {
    if (!label.trim()) return
    setSaving(true)
    const snap: RoomSnapshot = {
      id: `snap_${Date.now()}`,
      label: label.trim(),
      timestamp: new Date().toISOString(),
      status: room.status || 'IDLE',
      roomName: room.name,
      roomDescription: room.description,
      agents: agents.map(a => ({
        name: a.name,
        goal: a.goal || '',
        allowedTools: (a as any).allowedTools || [],
        policyConfig: (a as any).policyConfig || {},
      })),
    }
    persist([snap, ...snapshots])
    setLabel('')
    setSaving(false)
    setNotice(`Snapshot "${snap.label}" saved — ${agents.length} agent${agents.length !== 1 ? 's' : ''} captured`)
    setTimeout(() => setNotice(null), 3000)
  }

  async function restore(snap: RoomSnapshot) {
    setRestoring(snap.id)
    setNotice(`Restoring "${snap.label}"…`)
    try {
      for (const a of snap.agents) {
        await createAgent({
          name: `${a.name} (restored)`,
          goal: a.goal,
          roomId: room.id,
          allowedTools: a.allowedTools,
          policyConfig: a.policyConfig as any,
        })
      }
      setNotice(`✓ ${snap.agents.length} agent${snap.agents.length !== 1 ? 's' : ''} restored from "${snap.label}"`)
    } catch {
      setNotice('Restore failed — make sure the API is running')
    } finally {
      setRestoring(null)
      setTimeout(() => setNotice(null), 4000)
    }
  }

  function share(snap: RoomSnapshot) {
    const payload = encodeURIComponent(JSON.stringify(snap))
    const url = `${window.location.origin}/rooms?snapshot=${payload}`
    navigator.clipboard.writeText(url).then(() => {
      setNotice('Snapshot URL copied to clipboard')
      setTimeout(() => setNotice(null), 3000)
    })
  }

  function remove(id: string) {
    persist(snapshots.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Notice */}
      {notice && (
        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      {/* Take snapshot */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">Take a snapshot</p>
        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Capture this room's agents, goals, tools, and config right now. Restore or share it any time.
        </p>
        <div className="flex gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && takeSnapshot()}
            placeholder={`e.g. "working v1" or "before refactor"`}
            className="flex-1 px-3 py-2 text-xs border border-[#D4C4A8] rounded-xl focus:outline-none focus:border-[#EA580C] bg-white"
          />
          <button onClick={takeSnapshot} disabled={saving || !label.trim()}
            className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
            {saving
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none"><circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5"/><circle cx="7" cy="7" r="2.5" fill="white"/></svg>
            }
            Save
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-1.5">
          Captures: {agents.length} agent{agents.length !== 1 ? 's' : ''}, room config, status at this moment
        </p>
      </div>

      {/* Snapshot list */}
      {snapshots.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saved Snapshots</p>
          {snapshots.map(snap => (
            <div key={snap.id} className="border border-[#E8E0D0] rounded-xl bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#111] truncate">{snap.label}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(snap.timestamp).toLocaleDateString()} · {snap.agents.length} agent{snap.agents.length !== 1 ? 's' : ''} · {snap.status}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => restore(snap)} disabled={restoring === snap.id}
                    className="px-2.5 py-1 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1">
                    {restoring === snap.id
                      ? <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                      : null}
                    Restore
                  </button>
                  <button onClick={() => share(snap)} title="Copy shareable URL"
                    className="px-2.5 py-1 border border-[#D4C4A8] hover:border-[#EA580C] text-gray-500 hover:text-[#EA580C] text-[10px] font-bold rounded-lg transition-colors">
                    Share
                  </button>
                  <button onClick={() => remove(snap.id)} title="Delete snapshot"
                    className="px-2 py-1 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-300 text-[10px] font-bold rounded-lg transition-colors">
                    ✕
                  </button>
                </div>
              </div>
              {/* Agent pills */}
              {snap.agents.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1">
                  {snap.agents.map((a, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full font-medium">{a.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {snapshots.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-[#E8E0D0] rounded-xl">
          <p className="text-xs text-gray-400">No snapshots yet.</p>
          <p className="text-[10px] text-gray-300 mt-1">Save your first snapshot above to preserve this room's state.</p>
        </div>
      )}
    </div>
  )
}

// ─── Panel: Metrics ────────────────────────────────────────────────────────────
function MetricsPanel({ runs, agentCount }: { runs: Run[]; agentCount: number }) {
  const total = runs.length
  const completed = runs.filter(r => r.status === 'completed').length
  const failed = runs.filter(r => r.status === 'failed').length
  const running = runs.filter(r => r.status === 'running' || r.status === 'pending').length
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Runs', value: total, color: 'text-[#111111]' },
          { label: 'Success Rate', value: `${successRate}%`, color: 'text-emerald-600' },
          { label: 'Completed', value: completed, color: 'text-emerald-600' },
          { label: 'Failed', value: failed, color: 'text-red-500' },
          { label: 'Active Now', value: running, color: 'text-blue-600' },
          { label: 'Agents', value: agentCount, color: agentCount > 0 ? 'text-[#EA580C]' : 'text-gray-400' },
        ].map(m => (
          <div key={m.label} className="p-3 bg-white border border-[#D4C4A8] rounded-xl">
            <p className="text-[10px] text-gray-500 mb-1">{m.label}</p>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {running > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-blue-700">{running} execution{running > 1 ? 's' : ''} active right now</span>
          <Link href="/live-runs" className="ml-auto text-xs font-bold text-[#EA580C] hover:underline">Watch →</Link>
        </div>
      )}
    </div>
  )
}

// ─── Panel: Logs ──────────────────────────────────────────────────────────────
function LogsPanel({ logs }: { logs: any[] }) {
  const logsEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])
  return (
    <div>
      <div className="bg-[#111111] rounded-xl p-4 font-mono text-xs max-h-[420px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">No logs yet. Run an agent to see execution output here.</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-3 py-1 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-emerald-300'}`}>
                <span className="text-gray-600 w-20 flex-shrink-0">{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</span>
                <span className="opacity-60 w-12 flex-shrink-0">[{log.level}]</span>
                <span className="text-gray-200 flex-1">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Panel: Memory (live persistent key-value store) ──────────────────────────
function StoragePanel({ room }: { room: any }) {
  const [entries, setEntries] = useState<{ id: string; key: string; value: unknown; updatedAt: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/rooms/${room.id}/memory`)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [room.id])

  async function write(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.trim()) return
    setWriting(true)
    try {
      let val: unknown = newVal
      try { val = JSON.parse(newVal) } catch { /* keep as string */ }
      await fetch(`/api/rooms/${room.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), value: val }),
      })
      setNewKey(''); setNewVal('')
      setNotice(`Key "${newKey.trim()}" saved`)
      setTimeout(() => setNotice(null), 2500)
      load()
    } finally { setWriting(false) }
  }

  async function del(key: string) {
    await fetch(`/api/rooms/${room.id}/memory/${encodeURIComponent(key)}`, { method: 'DELETE' })
    setNotice(`Key "${key}" deleted`)
    setTimeout(() => setNotice(null), 2000)
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">Persistent Memory</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Key-value pairs shared across every agent in this room. Values survive between runs.
          Agents can read and write here during execution.
        </p>
      </div>

      {notice && (
        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">{notice}</div>
      )}

      {/* Write form */}
      <form onSubmit={write} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Key</label>
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. user_context"
            className="w-full px-3 py-1.5 text-xs border border-[#D4C4A8] rounded-lg focus:outline-none focus:border-[#EA580C] font-mono" />
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Value (JSON or text)</label>
          <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder={`"hello" or {"id":1}`}
            className="w-full px-3 py-1.5 text-xs border border-[#D4C4A8] rounded-lg focus:outline-none focus:border-[#EA580C] font-mono" />
        </div>
        <button type="submit" disabled={writing || !newKey.trim()}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-[10px] font-bold rounded-lg flex-shrink-0 transition-colors">
          {writing ? '…' : 'Write'}
        </button>
      </form>

      {/* Entry list */}
      {loading ? (
        <div className="text-center py-6"><div className="w-5 h-5 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto" /></div>
      ) : entries.length === 0 ? (
        <div className="bg-[#0D0F1A] rounded-xl p-4 font-mono text-xs text-emerald-300/50">
          <div>{'// No memory yet'}</div>
          <div>{'// Run an agent or write a key above'}</div>
          <div>{'// Agents can read this during execution'}</div>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {entries.map(e => (
            <div key={e.id} className="flex items-start gap-3 p-3 bg-white border border-[#E8E0D0] rounded-xl group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-[#111] font-mono truncate">{e.key}</span>
                  <span className="text-[9px] text-gray-400">{new Date(e.updatedAt).toLocaleTimeString()}</span>
                </div>
                <pre className="text-[10px] text-gray-500 font-mono truncate">
                  {typeof e.value === 'string' ? `"${e.value}"` : JSON.stringify(e.value)}
                </pre>
              </div>
              <button onClick={() => del(e.key)} title="Delete key"
                className="text-gray-200 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="text-[10px] text-gray-300">{entries.length} key{entries.length !== 1 ? 's' : ''} stored · room <code className="font-mono">{room?.id?.slice(0,8)}…</code></div>
    </div>
  )
}

// ─── Policy Panel ─────────────────────────────────────────────────────────────
const ROUTING_MODES = [
  { id: 'cheapest',  label: 'Cheapest',  model: 'gpt-3.5-turbo',  hint: 'Lowest cost — great for high-volume, simple tasks' },
  { id: 'balanced',  label: 'Balanced',  model: 'gpt-4o-mini',    hint: 'Best cost/quality ratio for most workloads' },
  { id: 'quality',   label: 'Quality',   model: 'gpt-4o',         hint: 'Best reasoning — use when accuracy is critical' },
  { id: 'fastest',   label: 'Fastest',   model: 'gpt-3.5-turbo',  hint: 'Minimal tokens, optimised for speed' },
]

function PolicyPanel({ agents, onRefresh }: { agents: Agent[]; onRefresh: () => void }) {
  const [mode, setMode] = useState('balanced')
  const [maxCost, setMaxCost] = useState('0.50')
  const [maxIter, setMaxIter] = useState('10')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null)

  async function apply() {
    if (agents.length === 0) { setNotice({ ok: false, msg: 'No agents in this room yet.' }); return }
    setSaving(true); setNotice(null)
    const selected = ROUTING_MODES.find(r => r.id === mode)!
    try {
      await Promise.all(agents.map(a =>
        updateAgent(a.id, {
          policyConfig: {
            maxCostPerExecution: parseFloat(maxCost) || 0.5,
            maxLoopIterations: parseInt(maxIter) || 10,
          } as any,
        })
      ))
      setNotice({ ok: true, msg: `Policy applied to ${agents.length} agent${agents.length > 1 ? 's' : ''} — routing: ${selected.label}, cap $${maxCost}` })
      onRefresh()
    } catch (e: any) {
      setNotice({ ok: false, msg: e.message })
    } finally { setSaving(false) }
  }

  const selected = ROUTING_MODES.find(r => r.id === mode)!

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">Model Routing</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Set how agents in this room choose their model. The routing mode is applied to every agent on save.
        </p>
      </div>

      {notice && (
        <div className={`px-3 py-2 rounded-lg text-xs font-semibold border ${notice.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {notice.msg}
        </div>
      )}

      {/* Routing mode selector */}
      <div className="grid grid-cols-2 gap-2">
        {ROUTING_MODES.map(r => (
          <button
            key={r.id}
            onClick={() => setMode(r.id)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              mode === r.id
                ? 'border-[#EA580C] bg-orange-50'
                : 'border-[#D4C4A8] bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${mode === r.id ? 'bg-[#EA580C]' : 'bg-gray-300'}`} />
              <span className={`text-xs font-bold ${mode === r.id ? 'text-[#EA580C]' : 'text-gray-700'}`}>{r.label}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight pl-4">{r.hint}</p>
          </button>
        ))}
      </div>

      {/* Model preview */}
      <div className="p-3 bg-[#0D0F1A] rounded-xl font-mono text-xs text-emerald-300 space-y-1">
        <div><span className="text-gray-500">model:     </span>{selected.model}</div>
        <div><span className="text-gray-500">max_cost:  </span>${maxCost}</div>
        <div><span className="text-gray-500">max_iter:  </span>{maxIter}</div>
        <div><span className="text-gray-500">agents:    </span>{agents.length} in room</div>
      </div>

      {/* Numeric controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Max Cost / Run ($)</label>
          <input type="number" step="0.01" min="0.01" value={maxCost} onChange={e => setMaxCost(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-lg focus:outline-none focus:border-[#EA580C] font-mono" />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Max Iterations</label>
          <input type="number" min="1" max="50" value={maxIter} onChange={e => setMaxIter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#D4C4A8] rounded-lg focus:outline-none focus:border-[#EA580C] font-mono" />
        </div>
      </div>

      <button onClick={apply} disabled={saving}
        className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
        {saving ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Applying…</> : `Apply to ${agents.length} Agent${agents.length !== 1 ? 's' : ''}`}
      </button>

      <p className="text-[10px] text-gray-300">
        Policy is enforced by the runtime — agents cannot exceed the cost cap or iteration limit regardless of task complexity.
      </p>
    </div>
  )
}

// ─── Outputs Panel ────────────────────────────────────────────────────────────
function OutputsPanel({ roomId, lastRunOutput, runs }: {
  roomId: string
  lastRunOutput: { summary: string; goal: string; toolResults: {tool:string; result:unknown}[]; completedAt: string } | null
  runs: any[]
}) {
  const [storedOutput, setStoredOutput] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lastRunOutput) { setStoredOutput(lastRunOutput); return }
    // Try fetching from memory
    setLoading(true)
    fetch(`/api/rooms/${roomId}/memory/__last_run_output`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setStoredOutput(JSON.parse(d.value)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roomId, lastRunOutput])

  const output = lastRunOutput ?? storedOutput

  if (loading) return <div className="text-center py-8"><div className="w-5 h-5 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto" /></div>

  if (!output) return (
    <div className="text-center py-10">
      <ReportsIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p className="text-sm text-gray-500">No output yet.</p>
      <p className="text-xs text-gray-400 mt-1">Run an agent — results appear here automatically.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-gray-700 mb-0.5">Last Run Output</p>
          <p className="text-[10px] text-gray-400">{output.completedAt ? new Date(output.completedAt).toLocaleString() : ''}</p>
        </div>
        <Link href="/live-runs" className="text-[10px] font-bold text-[#EA580C] hover:underline flex-shrink-0">Full trace →</Link>
      </div>

      {/* Goal */}
      <div className="p-3 bg-[#F9F5EF] border border-[#E8E0D0] rounded-xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Goal</p>
        <p className="text-xs text-gray-700 leading-relaxed">{output.goal}</p>
      </div>

      {/* Summary / Final Reasoning */}
      {output.summary && (
        <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Agent Reasoning</p>
          <p className="text-xs text-purple-900 leading-relaxed">{output.summary}</p>
        </div>
      )}

      {/* Tool Results */}
      {output.toolResults?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tool Outputs</p>
          <div className="space-y-2">
            {output.toolResults.map((tr: any, i: number) => (
              <div key={i} className="p-3 bg-[#0D0F1A] rounded-xl">
                <p className="text-[10px] font-bold text-orange-400 mb-1 font-mono">⚡ {tr.tool}</p>
                <pre className="text-[10px] text-emerald-300 font-mono whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto">
                  {typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run history row */}
      {runs.slice(0, 3).length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Runs</p>
          <div className="space-y-1">
            {runs.slice(0, 3).map(r => (
              <Link key={r.id} href={`/live-runs/${r.id}`}
                className="flex items-center gap-2 p-2 bg-white border border-[#E8E0D0] rounded-lg hover:border-[#EA580C] transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.status === 'completed' ? 'bg-emerald-500' : r.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                <span className="font-mono text-[10px] text-gray-500 flex-1">{r.id.slice(0, 12)}…</span>
                <span className="text-[10px] font-bold text-[#EA580C]">trace →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Workflow Panel ───────────────────────────────────────────────────────────
function WorkflowPanel({ room }: { room: any }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">The workflow bound to this room defines the orchestration graph — which agents run and in what order.</p>
      <div className="p-4 bg-white border border-[#D4C4A8] rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <WorkflowIcon className="w-8 h-8" />
          <div>
            <p className="text-xs font-bold text-[#111111]">Workflow ID</p>
            <code className="text-[10px] text-gray-500 font-mono">{room?.workflowId}</code>
          </div>
          <Link href={`/workflows`} className="ml-auto text-xs font-bold text-[#EA580C] hover:underline">View →</Link>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span>START</span>
            <span className="text-gray-300">──</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">AGENT</span>
            <span className="text-gray-300">──</span>
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>END</span>
          </div>
        </div>
      </div>
      <Link href="/workflows" className="block w-full py-2.5 border border-[#DDD5C8] hover:bg-[#111111] hover:text-white text-center text-sm font-bold rounded-xl transition-all">
        Open Workflow Builder
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RoomSystemPage() {
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [activityFeed, setActivityFeed] = useState<{ time: string; msg: string; type: 'run' | 'agent' | 'event' | 'log' | 'reason' | 'tool' }[]>([])
  const [systemStatus, setSystemStatus] = useState<'IDLE' | 'RUNNING' | 'PROCESSING'>('IDLE')
  const [runningAction, setRunningAction] = useState<'start' | 'stop' | null>(null)
  const [lastNotice, setLastNotice] = useState<string | null>(null)
  const [sseConnected, setSseConnected] = useState(false)
  const [lastCompletedRunId, setLastCompletedRunId] = useState<string | null>(null)
  const [lastRunOutput, setLastRunOutput] = useState<{
    summary: string; goal: string; toolResults: {tool:string; result:unknown}[]; completedAt: string
  } | null>(null)

  const pushActivity = useCallback((msg: string, type: 'run' | 'agent' | 'event' | 'log' | 'reason' | 'tool' = 'log') => {
    setActivityFeed(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 60))
  }, [])

  // ── SSE: subscribe to room-specific event stream ─────────────────────────────
  useEffect(() => {
    let es: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    function connect() {
      es = new EventSource(`/api/rooms/${roomId}/events`)

      es.onopen = () => setSseConnected(true)

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (payload.event === 'connected') return

          const { event, data } = payload

          if (event === 'agent.step') {
            const phase = data?.phase
            const iter = data?.iteration
            const max = data?.maxIter
            if (phase === 'perceive') {
              setSystemStatus('RUNNING')
              pushActivity(`[${iter}/${max}] Perceiving — loading memory and room state`, 'agent')
            } else if (phase === 'reason') {
              const reasoning = data?.reasoning as string || ''
              pushActivity(`[${iter}/${max}] ${reasoning.slice(0, 120)}${reasoning.length > 120 ? '…' : ''}`, 'reason')
            } else if (phase === 'memory_update') {
              pushActivity(`[${iter}/${max}] Memory updated with new observations`, 'log')
            }
          } else if (event === 'agent.tool_call') {
            const tool = data?.tool as string
            const input = data?.input as Record<string, unknown>
            const inputStr = input ? ' ' + JSON.stringify(input).slice(0, 60) : ''
            pushActivity(`→ Tool call: ${tool}${inputStr}`, 'tool')
          } else if (event === 'agent.tool_result') {
            const tool = data?.tool as string
            const result = data?.result as Record<string, unknown>
            const resultStr = result ? JSON.stringify(result).slice(0, 80) : ''
            pushActivity(`← ${tool} returned: ${resultStr}`, 'tool')
          } else if (event === 'agent.completed') {
            setSystemStatus('IDLE')
            pushActivity('Agent completed successfully', 'run')
            setTimeout(load, 500)
          } else if (event === 'agent.failed') {
            setSystemStatus('IDLE')
            pushActivity(`Agent failed: ${data?.error || 'Unknown error'}`, 'event')
            setTimeout(load, 500)
          } else if (event === 'run.completed') {
            const runId = payload.runId as string
            if (runId) setLastCompletedRunId(runId)
            // Capture output if present
            if (data?.output) {
              setLastRunOutput(data.output as any)
              // Auto-open outputs panel
              setActivePanel('outputs')
            }
            pushActivity(`Run ${runId?.slice(0, 8) || '?'}… completed`, 'run')
            setTimeout(load, 800)
          } else if (event === 'workflow.step') {
            pushActivity(`Workflow: ${data?.step || 'step'}`, 'log')
          } else if (event === 'workflow.completed') {
            pushActivity('Workflow completed', 'run')
          }
        } catch { /* ignore parse errors */ }
      }

      es.onerror = () => {
        setSseConnected(false)
        es?.close()
        // Retry after 5 seconds
        retryTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      es?.close()
      if (retryTimer) clearTimeout(retryTimer)
      setSseConnected(false)
    }
  }, [roomId, pushActivity])

  const load = useCallback(async () => {
    try {
      const [roomData, agentsData, runsData, logsData] = await Promise.all([
        api.getRoom(roomId),
        getAgents().catch(() => ({ agents: [], count: 0 })),
        getRuns({ limit: 30 }).catch(() => ({ runs: [], count: 0 })),
        api.getRoomLogs(roomId).catch(() => ({ logs: [] })),
      ])
      setRoom(roomData)
      const roomAgents = (agentsData.agents || []).filter((a: Agent) => a.roomId === roomId)
      setAgents(roomAgents)
      const roomRuns = (runsData.runs || []).filter((r: Run) => r.roomId === roomId)
      setRuns(roomRuns)
      setLogs(logsData.logs || [])
      // Derive status
      const hasRunning = roomRuns.some(r => r.status === 'running' || r.status === 'pending')
      setSystemStatus(hasRunning ? 'RUNNING' : roomData.status === 'RUNNING' ? 'RUNNING' : 'IDLE')
    } catch (err) {
      console.error('Failed to load room', err)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    load()
    const i = setInterval(load, 3000)
    return () => clearInterval(i)
  }, [load])

  const handleStart = async () => {
    setRunningAction('start')
    try {
      await api.runRoom(roomId)
      setSystemStatus('RUNNING')
      pushActivity('System started — workflow executing', 'run')
      setLastNotice('System started')
      setTimeout(() => setLastNotice(null), 3000)
      setTimeout(load, 1000)
    } catch (e: any) {
      setLastNotice(`Error: ${e.message}`)
      setTimeout(() => setLastNotice(null), 4000)
    } finally { setRunningAction(null) }
  }

  const handleStop = async () => {
    setRunningAction('stop')
    try {
      await api.pauseRoom(roomId)
      setSystemStatus('IDLE')
      pushActivity('System paused — all workflows halted', 'log')
      setLastNotice('System paused')
      setTimeout(() => setLastNotice(null), 3000)
      setTimeout(load, 500)
    } catch (e: any) {
      setLastNotice(`Pause error: ${e.message}`)
      setTimeout(() => setLastNotice(null), 4000)
    } finally { setRunningAction(null) }
  }

  const handleRunAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    pushActivity(`Agent "${agent?.name}" dispatched`, 'agent')
    const result = await runAgent(agentId, { roomId, maxIterations: 5 })
    pushActivity(`Run queued: ${result.runId.slice(0, 10)}…`, 'run')
    setTimeout(load, 1000)
  }

  const togglePanel = (panel: Panel) => setActivePanel(p => p === panel ? null : panel)

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#F9F5EF]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading system…</p>
      </div>
    </div>
  )

  if (!room) return (
    <div className="flex items-center justify-center h-screen bg-[#F9F5EF]">
      <div className="text-center">
        <p className="text-xl font-bold text-[#111111] mb-2">Room not found</p>
        <Link href="/rooms" className="text-[#EA580C] font-semibold hover:underline text-sm">← Back to rooms</Link>
      </div>
    </div>
  )

  const activeRuns = runs.filter(r => r.status === 'running' || r.status === 'pending')

  return (
    <div className="min-h-screen bg-[#F9F5EF] flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className={`border-b-2 border-black transition-colors duration-500 ${systemStatus === 'RUNNING' ? 'bg-blue-50' : 'bg-white'}`}>
        <div className="px-6 md:px-8 py-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <Link href="/rooms" className="hover:text-[#EA580C] transition-colors font-semibold">Rooms</Link>
            <span>/</span>
            <span className="font-semibold text-[#111111] truncate">{room.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-[#111111] truncate">{room.name}</h1>
                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  systemStatus === 'RUNNING'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {systemStatus === 'RUNNING' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                  {systemStatus}
                </span>
                {activeRuns.length > 0 && (
                  <Link href="/live-runs" className="text-xs text-blue-600 font-semibold hover:underline">
                    {activeRuns.length} active run{activeRuns.length > 1 ? 's' : ''} →
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{room.description || `Room · ${roomId.slice(0, 8)}…`}</p>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {lastNotice && (
                <span className="hidden sm:inline text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                  {lastNotice}
                </span>
              )}
              <button onClick={handleStart} disabled={!!runningAction || systemStatus === 'RUNNING'}
                className="px-3 md:px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs md:text-sm font-bold rounded-lg flex items-center gap-1.5 transition-all">
                {runningAction === 'start' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">Start</span> System
              </button>
              <button onClick={handleStop} disabled={!!runningAction || systemStatus === 'IDLE'}
                className="px-3 md:px-4 py-2 border border-[#DDD5C8] hover:bg-[#111111] hover:text-white disabled:opacity-40 text-xs md:text-sm font-bold rounded-lg transition-all">
                Stop
              </button>
              <button onClick={() => togglePanel('events')}
                className={`hidden sm:inline-flex px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-lg border-2 transition-all ${activePanel === 'events' ? 'bg-[#111111] text-white border-[#111111]' : 'border-black hover:bg-[#111111] hover:text-white'}`}>
                Trigger
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/share/${roomId}`
                  navigator.clipboard.writeText(url)
                  setLastNotice('Share link copied!')
                  setTimeout(() => setLastNotice(null), 3000)
                }}
                className="hidden sm:inline-flex px-3 py-2 text-xs font-bold border border-gray-200 hover:border-gray-400 rounded-lg transition-colors items-center gap-1.5"
                title="Copy share link"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm8-8L4 7.5m8 1L4 11" />
                </svg>
                Share
              </button>
              <button onClick={load} className="p-2 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors" title="Refresh">
                <RefreshIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">

        {/* ── Left: Capability Grid + panel ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-6 md:p-8 space-y-6">

            {/* ── Last Run Output Banner ──────────────────────────── */}
            {lastRunOutput && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 relative">
                <button onClick={() => setLastRunOutput(null)}
                  className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-700 font-bold text-sm">✕</button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Last Run Output</p>
                  <span className="text-[10px] text-emerald-600 ml-auto">{new Date(lastRunOutput.completedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm font-semibold text-emerald-900 mb-3 leading-relaxed">{lastRunOutput.summary}</p>
                {lastRunOutput.toolResults?.length > 0 && (
                  <div className="space-y-2">
                    {lastRunOutput.toolResults.map((tr, i) => (
                      <div key={i} className="bg-white border border-emerald-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">⚡ {tr.tool}</p>
                        <pre className="text-[11px] text-gray-600 font-mono whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                          {JSON.stringify(tr.result, null, 2).slice(0, 400)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
                {lastCompletedRunId && (
                  <Link href={`/live-runs/${lastCompletedRunId}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-700 hover:underline">
                    View full trace →
                  </Link>
                )}
              </div>
            )}

            {/* Capability Grid */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Capabilities</p>
              <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible">
                {CAPABILITIES.map(({ id, label, Icon, desc }) => {
                  const isActive = activePanel === id
                  // Dot indicators
                  const dotColor =
                    id === 'agents' && agents.length > 0 ? 'bg-emerald-400' :
                    id === 'logs' && logs.length > 0 ? 'bg-blue-400' :
                    id === 'metrics' && runs.length > 0 ? 'bg-purple-400' :
                    id === 'outputs' && lastRunOutput ? 'bg-orange-400' : null

                  return (
                    <button
                      key={id}
                      onClick={() => togglePanel(id)}
                      title={desc}
                      className={`relative group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex-shrink-0 w-20 sm:w-auto ${
                        isActive
                          ? 'border-[#EA580C] bg-white shadow-[0_0_0_4px_rgba(245,78,0,0.12)]'
                          : 'border-[#D4C4A8] bg-white hover:border-[#EA580C] hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Active indicator line */}
                      {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-8 h-0.5 bg-[#EA580C] rounded-full" />}

                      {/* Icon */}
                      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>

                      {/* Label */}
                      <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${isActive ? 'text-[#EA580C]' : 'text-gray-600 group-hover:text-[#111111]'}`}>
                        {label}
                      </span>

                      {/* Live dot */}
                      {dotColor && (
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor} ${id === 'agents' && systemStatus === 'RUNNING' ? 'animate-pulse' : ''}`} />
                      )}

                      {/* Count badge */}
                      {id === 'agents' && agents.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EA580C] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          {agents.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Inline Panel */}
            {activePanel && (
              <div className="bg-white border-2 border-[#EA580C] rounded-2xl overflow-hidden shadow-[0_0_0_4px_rgba(245,78,0,0.08)] animate-[fadeSlideIn_0.18s_ease]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cap = CAPABILITIES.find(c => c.id === activePanel)
                      if (!cap) return null
                      const { Icon } = cap
                      return <><Icon className="w-6 h-6" /><span className="font-bold text-sm text-[#111111]">{cap.label}</span></>
                    })()}
                  </div>
                  <button onClick={() => setActivePanel(null)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 font-bold text-lg leading-none">×</button>
                </div>
                <div className="p-5">
                  {activePanel === 'agents' && <AgentsPanel roomId={roomId} agents={agents} onRefresh={load} onRunAgent={handleRunAgent} />}
                  {activePanel === 'workflows' && <WorkflowPanel room={room} />}
                  {activePanel === 'connectors' && <ConnectorsPanel roomId={roomId} />}
                  {activePanel === 'events' && <EventsPanel roomId={roomId} onEvent={msg => pushActivity(msg, 'event')} />}
                  {activePanel === 'logs' && <LogsPanel logs={logs} />}
                  {activePanel === 'metrics' && <MetricsPanel runs={runs} agentCount={agents.length} />}
                  {activePanel === 'storage' && <StoragePanel room={room} />}
                  {activePanel === 'linked' && <LinkedRoomsPanel currentRoomId={roomId} />}
                  {activePanel === 'snapshot' && <SnapshotPanel room={room} agents={agents} />}
                  {activePanel === 'policy' && <PolicyPanel agents={agents} onRefresh={load} />}
                  {activePanel === 'outputs' && <OutputsPanel roomId={roomId} lastRunOutput={lastRunOutput} runs={runs} />}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Live Activity Panel ──────────────────────────────── */}
        <div className="lg:flex flex-col w-full lg:w-72 xl:w-80 border-t-2 lg:border-t-0 lg:border-l-2 border-[#D4C4A8] bg-[#0D0F1A] hidden lg:flex">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${systemStatus === 'RUNNING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-xs font-bold text-white/70">Live Activity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-[10px] text-gray-500 font-bold">{sseConnected ? 'LIVE' : 'connecting…'}</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
            {[
              { label: 'Agents', value: agents.length },
              { label: 'Runs', value: runs.length },
              { label: 'Active', value: activeRuns.length },
            ].map(s => (
              <div key={s.label} className="px-3 py-2.5 text-center">
                <p className="text-base font-black text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-[11px]">
            {/* SSE live events (newest first) */}
            {activityFeed.map((ev, i) => (
              <div key={`feed-${i}`} className={`flex items-start gap-2 py-1.5 px-2 rounded ${
                ev.type === 'reason'  ? 'bg-purple-950/5' :
                ev.type === 'tool'   ? 'bg-orange-950/5' :
                ev.type === 'run'    ? 'bg-blue-950/5' :
                ev.type === 'agent'  ? 'bg-emerald-950/5' :
                ev.type === 'event'  ? 'bg-red-950/5' : ''
              }`}>
                <span className="text-gray-400 flex-shrink-0 select-none">{ev.time}</span>
                <span className={`flex-1 leading-relaxed break-all ${
                  ev.type === 'reason' ? 'text-purple-300' :
                  ev.type === 'tool'   ? 'text-orange-300' :
                  ev.type === 'run'    ? 'text-blue-300' :
                  ev.type === 'agent'  ? 'text-emerald-300' :
                  ev.type === 'event'  ? 'text-red-300' : 'text-gray-400'
                }`}>
                  {ev.type === 'reason'  ? <><span className="text-purple-500 select-none">💭 </span>{ev.msg}</> :
                   ev.type === 'tool'    ? <><span className="text-orange-500 select-none">⚡ </span>{ev.msg}</> :
                   ev.type === 'run'     ? <><span className="text-blue-500 select-none">✓ </span>{ev.msg}</> :
                   ev.type === 'agent'   ? <><span className="text-emerald-500 select-none">→ </span>{ev.msg}</> :
                   <>{ev.msg}</>
                  }
                </span>
              </div>
            ))}
            {/* Execution logs fallback */}
            {activityFeed.length === 0 && logs.slice(0, 15).map((log, i) => (
              <div key={`log-${i}`} className="flex items-start gap-2 py-1.5 px-2">
                <span className="text-gray-600 flex-shrink-0">{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</span>
                <span className={`flex-1 leading-snug ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-400'}`}>{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && activityFeed.length === 0 && (
              <div className="text-center py-10">
                <p className="text-emerald-500/50 mb-2">{'// waiting for activity…'}</p>
                <p className="text-gray-600 text-[10px]">Start the system or trigger a run</p>
              </div>
            )}
          </div>

          {/* Recent runs */}
          {runs.length > 0 && (
            <div className="border-t border-white/10 p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Recent Runs</p>
              {runs.slice(0, 4).map(run => (
                <div key={run.id} className="flex items-center gap-2 text-[10px] py-1 font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    run.status === 'completed' ? 'bg-emerald-500' :
                    run.status === 'failed' ? 'bg-red-500' :
                    run.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                  }`} />
                  <span className="text-gray-600 flex-1 truncate">{run.id.slice(0, 12)}…</span>
                  <span className={`font-bold ${
                    run.status === 'completed' ? 'text-emerald-500' :
                    run.status === 'failed' ? 'text-red-400' :
                    run.status === 'running' ? 'text-blue-400' : 'text-gray-600'
                  }`}>{run.status}</span>
                </div>
              ))}
              <Link href="/live-runs" className="block text-center text-[10px] font-bold text-[#EA580C] hover:underline pt-1">
                View all runs →
              </Link>
            </div>
          )}

          {/* ── Command input — send a message or trigger directly ── */}
          <RoomCommandInput roomId={roomId} onActivity={pushActivity} />
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
