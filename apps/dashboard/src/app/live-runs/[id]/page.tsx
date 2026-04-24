'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getRunTrace, getLogsByRun } from '@/lib/api'
import type { AgentTrace, ExecutionLog, Run } from '@/lib/api'
import { LiveRunsIcon, MemoryIcon, WorkflowIcon, AgentIcon } from '@/components/icons/system'
import { CheckCircleIcon, AlertCircleIcon, ClockIcon } from '@/components/icons'

// Rough token cost per 1K tokens (input+output blended) by model name fragment
const MODEL_COST_PER_1K: Record<string, number> = {
  'gpt-4o-mini': 0.00015,
  'gpt-4o':      0.005,
  'gpt-4-turbo': 0.01,
  'gpt-4':       0.03,
  'gpt-3.5':     0.0005,
  'claude-3-haiku': 0.00025,
  'claude-3-sonnet': 0.003,
  'claude-3-opus':   0.015,
}

function estimateCost(modelName?: string, tokens?: number): string | null {
  if (!modelName || !tokens) return null
  const key = Object.keys(MODEL_COST_PER_1K).find(k => modelName.toLowerCase().includes(k))
  if (!key) return null
  const cost = (tokens / 1000) * MODEL_COST_PER_1K[key]
  return cost < 0.01 ? `$${cost.toFixed(5)}` : `$${cost.toFixed(4)}`
}

function formatMs(ms?: number) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
}

function StateChip({ state }: { state: string }) {
  const map: Record<string, string> = {
    PERCEIVE:   'bg-violet-100 text-violet-700',
    REASON:     'bg-blue-100 text-blue-700',
    ACT:        'bg-orange-100 text-orange-700',
    OBSERVE:    'bg-teal-100 text-teal-700',
    COMPLETE:   'bg-emerald-100 text-emerald-700',
    ERROR:      'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${map[state] || 'bg-gray-100 text-gray-600'}`}>
      {state}
    </span>
  )
}

function StepCard({ trace, index }: { trace: AgentTrace; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
      trace.loopState === 'ERROR' ? 'border-red-200' :
      trace.loopState === 'COMPLETE' ? 'border-emerald-200' :
      'border-[#E8E0D0]'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#FDFAF7] transition-colors text-left"
      >
        {/* Step number */}
        <span className="w-6 h-6 rounded-full bg-[#F0EAE0] text-[#EA580C] text-[10px] font-black flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>

        <StateChip state={trace.loopState} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#111] truncate">
            {trace.selectedTool
              ? `→ ${trace.selectedTool}`
              : trace.loopState === 'REASON'
              ? 'Reasoning step'
              : trace.loopState === 'PERCEIVE'
              ? 'Loading memory + context'
              : trace.loopState === 'COMPLETE'
              ? 'Execution complete'
              : 'Processing'}
          </p>
          <p className="text-[10px] text-gray-400">{formatTime(trace.timestamp)}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {(trace as any).modelName && (
            <span className="text-[9px] font-mono text-gray-300 hidden sm:inline">{(trace as any).modelName}</span>
          )}
          {estimateCost((trace as any).modelName, (trace as any).totalTokens) && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              {estimateCost((trace as any).modelName, (trace as any).totalTokens)}
            </span>
          )}
          {trace.durationMs !== undefined && (
            <span className="text-[10px] font-mono text-gray-400">{formatMs(trace.durationMs)}</span>
          )}
          <svg viewBox="0 0 12 12" className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none">
            <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#E8E0D0] bg-[#FDFAF7] divide-y divide-[#F0EAE0]">
          {/* Reasoning */}
          {trace.modelResponse && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Agent Reasoning</p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{trace.modelResponse}</p>
            </div>
          )}

          {/* Tool */}
          {trace.selectedTool && (
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tool Called</p>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">{trace.selectedTool}</span>
              </div>
              {trace.toolRationale && (
                <p className="text-xs text-gray-500 italic">&ldquo;{trace.toolRationale}&rdquo;</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {trace.toolInput !== undefined && trace.toolInput !== null ? (
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Input</p>
                    <pre className="text-[10px] bg-gray-900 text-green-400 rounded-lg p-2 overflow-x-auto font-mono leading-relaxed">
                      {JSON.stringify(trace.toolInput, null, 2).slice(0, 400)}
                    </pre>
                  </div>
                ) : null}
                {trace.toolOutput !== undefined && trace.toolOutput !== null ? (
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Output</p>
                    <pre className="text-[10px] bg-gray-900 text-blue-300 rounded-lg p-2 overflow-x-auto font-mono leading-relaxed">
                      {JSON.stringify(trace.toolOutput, null, 2).slice(0, 400)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Prompt (collapsed by default) */}
          {trace.modelPrompt && (
            <details className="px-4 py-3 group">
              <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none list-none flex items-center gap-1">
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 transition-transform group-open:rotate-90" fill="none">
                  <path d="M3 2 L7 5 L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Full prompt
              </summary>
              <pre className="mt-2 text-[9px] text-gray-500 font-mono leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto">
                {trace.modelPrompt}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default function RunTracePage() {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<Run | null>(null)
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'trace' | 'logs'>('trace')

  useEffect(() => {
    if (!id) return
    Promise.all([
      getRunTrace(id).catch(() => null),
      getLogsByRun(id).catch(() => ({ logs: [] })),
    ]).then(([traceData, logData]) => {
      if (traceData) {
        setRun(traceData.run)
        setTraces(traceData.traces || [])
      } else {
        setError('Trace not available — run the backend to capture traces.')
      }
      setLogs(logData?.logs || [])
    }).finally(() => setLoading(false))
  }, [id])

  const totalDuration = (() => {
    if (!run?.startedAt) return null
    const end = run.endedAt ? new Date(run.endedAt) : new Date()
    return end.getTime() - new Date(run.startedAt).getTime()
  })()

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E8E0D0] bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/live-runs" className="text-gray-400 hover:text-[#EA580C] transition-colors">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
              <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <LiveRunsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-base font-extrabold text-[#111]">Execution Trace</h1>
            <code className="text-[10px] text-gray-400 font-mono">{id}</code>
          </div>
        </div>

        {run && (
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              run.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
              run.status === 'failed' ? 'bg-red-100 text-red-700' :
              run.status === 'running' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {run.status?.toUpperCase()}
            </span>
            {totalDuration !== null && (
              <span className="text-xs text-gray-500 font-mono">{formatMs(totalDuration)}</span>
            )}
            {traces.length > 0 && (
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ run, traces, logs }, null, 2)], { type: 'application/json' })
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                  a.download = `trace-${id?.slice(0,8)}.json`; a.click()
                }}
                className="px-3 py-1 border border-[#D4C4A8] hover:border-[#EA580C] text-xs font-bold text-gray-500 hover:text-[#EA580C] rounded-full transition-colors"
              >
                Export JSON
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {!loading && !error && (
        <div className="bg-white border-b border-[#E8E0D0] px-6 py-3">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <AgentIcon className="w-4 h-4" />
              <strong className="text-[#111]">{traces.length}</strong> steps captured
            </span>
            <span className="flex items-center gap-1.5">
              <WorkflowIcon className="w-4 h-4" />
              <strong className="text-[#111]">{traces.filter(t => t.selectedTool).length}</strong> tool calls
            </span>
            <span className="flex items-center gap-1.5">
              <MemoryIcon className="w-4 h-4" />
              <strong className="text-[#111]">{logs.length}</strong> log entries
            </span>
            {run?.error && (
              <span className="flex items-center gap-1.5 text-red-600 ml-auto">
                <AlertCircleIcon className="w-4 h-4" />
                {run.error}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading execution trace…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <ClockIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">Trace data not available</p>
              <p className="text-xs text-amber-600 mt-0.5">{error}</p>
            </div>
            <Link href="/live-runs" className="ml-auto text-xs font-bold text-amber-700 hover:underline">← Back to runs</Link>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 border-b-2 border-[#E8E0D0]">
              {([['trace', 'Decision Trace'], ['logs', 'Execution Logs']] as const).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-[2px] transition-all ${tab === t ? 'border-[#EA580C] text-[#EA580C]' : 'border-transparent text-gray-500 hover:text-[#111]'}`}>
                  {label}
                  <span className="ml-1.5 opacity-50">{t === 'trace' ? traces.length : logs.length}</span>
                </button>
              ))}
            </div>

            {tab === 'trace' && (
              <div className="space-y-2">
                {traces.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-[#E8E0D0]">
                    <LiveRunsIcon className="w-14 h-14 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-semibold text-gray-600">No trace steps yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Trace steps are captured during agent execution. Run an agent to see its full decision timeline here.
                    </p>
                  </div>
                ) : (
                  traces.map((trace, i) => (
                    <StepCard key={trace.id} trace={trace} index={i} />
                  ))
                )}
              </div>
            )}

            {tab === 'logs' && (
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-[#E8E0D0]">
                    <p className="text-sm text-gray-500">No logs for this run</p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={log.id ?? i} className="flex gap-3 p-3 bg-white rounded-xl border border-[#E8E0D0] text-xs">
                      <div className="flex-shrink-0 mt-0.5">
                        {log.level === 'ERROR'
                          ? <AlertCircleIcon className="w-4 h-4 text-red-500" />
                          : log.eventType?.includes('COMPLETED')
                          ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                          : <ClockIcon className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.eventType?.startsWith('AGENT') ? 'bg-purple-100 text-purple-700' :
                            log.eventType?.startsWith('TOOL') ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{log.eventType}</span>
                          <span className="text-gray-400 font-mono">{formatTime(log.timestamp)}</span>
                        </div>
                        <p className="text-gray-800 leading-snug">{log.message}</p>
                        {log.data && Object.keys(log.data).length > 0 && (
                          <pre className="text-[9px] text-gray-400 mt-1 bg-gray-50 rounded p-1.5 overflow-x-auto">
                            {JSON.stringify(log.data, null, 1).slice(0, 300)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
