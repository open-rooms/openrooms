'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgentsIllustrationIcon } from '@/components/icons';
import { getAgent, getAgentTraces, executeAgent, updateAgent, runAgent, getRuns, getLogsByRun, type Run, type ExecutionLog } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description?: string;
  goal: string;
  version: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  loopState: string;
  allowedTools: string[];
  policyConfig: any;
  memoryState: any;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
}

interface Trace {
  id: string;
  loopIteration: number;
  loopState: string;
  selectedTool?: string;
  toolRationale?: string;
  durationMs?: number;
  timestamp: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'traces' | 'policy' | 'memory'>('overview');
  const [executing, setExecuting] = useState(false);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [runLogs, setRunLogs] = useState<ExecutionLog[]>([]);
  const runPollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAgent();
    fetchTraces();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await getAgent(agentId);
      setAgent(data);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraces = async () => {
    try {
      const data = await getAgentTraces(agentId, 50);
      setTraces(data.traces || []);
    } catch (error) {
      console.error('Failed to fetch traces:', error);
    }
  };

  const pollRun = async (runId: string) => {
    try {
      const runsData = await getRuns({ targetId: agentId });
      const run = (runsData.runs || []).find(r => r.id === runId) || null;
      setActiveRun(run);
      if (run) {
        const logsData = await getLogsByRun(runId).catch(() => ({ logs: [], runId, count: 0 }));
        setRunLogs(logsData.logs || []);
      }
      if (run && (run.status === 'completed' || run.status === 'failed')) {
        if (runPollRef.current) clearInterval(runPollRef.current);
        fetchAgent();
        fetchTraces();
      }
    } catch { /* silent */ }
  };

  const handleExecute = async () => {
    if (!agent) return;

    setExecuting(true);
    setLastRunId(null);
    setActiveRun(null);
    setRunLogs([]);
    if (runPollRef.current) clearInterval(runPollRef.current);

    try {
      const data = await runAgent(agentId, {
        roomId: agent.roomId || undefined,
        maxIterations: 5,
      });
      setLastRunId(data.runId);
      // Poll run status every 2 seconds
      runPollRef.current = setInterval(() => pollRun(data.runId), 2000);
      pollRun(data.runId);
    } catch (error) {
      console.error('Failed to run agent:', error);
      alert(`Could not start agent run: ${(error as Error).message}`);
    } finally {
      setExecuting(false);
    }
  };

  useEffect(() => {
    return () => { if (runPollRef.current) clearInterval(runPollRef.current); };
  }, []);

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    try {
      await updateAgent(agentId, { status: newStatus });

      if (true) {
        fetchAgent();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8DCC8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54E00] mb-4"></div>
          <p className="text-gray-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#E8DCC8] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-[#111111] mb-2">Agent not found</h2>
          <p className="text-gray-600 text-sm mb-6">
            This agent may have been deleted or you may have an outdated link.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/agents" className="px-5 py-2 bg-[#F54E00] text-white font-bold rounded-lg text-sm hover:bg-[#E24600]">
              ← View All Agents
            </Link>
            <Link href="/agents/create" className="px-5 py-2 bg-white border-2 border-black text-[#111111] font-bold rounded-lg text-sm hover:bg-gray-50">
              + Create Agent
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLoopStateColor = (state: string) => {
    switch (state) {
      case 'IDLE': return 'text-gray-500';
      case 'PERCEIVING': return 'text-blue-500';
      case 'REASONING': return 'text-purple-500';
      case 'SELECTING_TOOL': return 'text-indigo-500';
      case 'EXECUTING_TOOL': return 'text-orange-500';
      case 'UPDATING_MEMORY': return 'text-teal-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 animate-fade-in">
          <Link href="/agents" className="text-[#F54E00] hover:underline font-semibold">
            ← Back to agents
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white border-2 border-black rounded-lg p-6 mb-6 animate-slide-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <AgentsIllustrationIcon className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold text-[#111111] mb-1">{agent.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-mono">v{agent.version}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                  <span className={`font-mono text-sm ${getLoopStateColor(agent.loopState)}`}>
                    {agent.loopState}
                  </span>
                </div>
              </div>
            </div>

            {lastRunId && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800">
                  ✓ Run queued — <code className="font-mono">{lastRunId}</code>
                </span>
                <div className="flex items-center gap-2">
                  <Link href="/live-runs" className="font-bold text-emerald-700 hover:underline">Live Runs →</Link>
                  <button onClick={() => setLastRunId(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleExecute}
                disabled={executing || agent.status !== 'ACTIVE'}
                className="px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing ? 'Starting Run…' : '▶ Run Agent'}
              </button>
              <select
                value={agent.status}
                onChange={(e) => handleUpdateStatus(e.target.value as any)}
                className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Live Run Status Panel */}
          {activeRun && (
            <div className={`mb-4 rounded-xl border-2 p-4 ${
              activeRun.status === 'running' ? 'border-blue-300 bg-blue-50'
              : activeRun.status === 'completed' ? 'border-emerald-300 bg-emerald-50'
              : 'border-red-300 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {activeRun.status === 'running' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  {activeRun.status === 'completed' && <span className="text-emerald-600">✓</span>}
                  {activeRun.status === 'failed' && <span className="text-red-600">✗</span>}
                  <span className="font-bold text-sm">
                    {activeRun.status === 'running' ? 'Agent is executing…'
                      : activeRun.status === 'completed' ? 'Run completed'
                      : `Run failed: ${activeRun.error}`}
                  </span>
                </div>
                <code className="text-xs font-mono text-gray-500">{activeRun.id.slice(0, 8)}…</code>
              </div>
              {runLogs.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {runLogs.map((log, i) => (
                    <div key={log.id ?? i} className="flex gap-2 text-xs bg-white/70 rounded p-2">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        log.eventType?.startsWith('AGENT') ? 'bg-purple-100 text-purple-700'
                        : log.eventType?.startsWith('TOOL') ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>{log.eventType?.replace(/_/g,' ')}</span>
                      <span className="text-gray-700">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/live-runs" className="mt-2 inline-block text-xs font-bold text-[#F54E00] hover:underline">
                Full execution log →
              </Link>
            </div>
          )}

          <p className="text-gray-700 mb-4">
            <span className="font-semibold text-gray-900">Goal:</span> {agent.goal}
          </p>

          {agent.description && (
            <p className="text-gray-600 text-sm">{agent.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {(['overview', 'traces', 'policy', 'memory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#F54E00] text-white border-2 border-[#F54E00]'
                  : 'bg-white text-[#111111] border-2 border-black hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'overview' && (
            <div className="grid gap-6">
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#111111] mb-4">Configuration</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Agent ID</span>
                    <p className="font-mono text-sm">{agent.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Version</span>
                    <p className="font-mono">{agent.version}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Allowed Tools</span>
                    <p className="font-mono">{agent.allowedTools.length} tools</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Room ID</span>
                    <p className="font-mono text-sm">{agent.roomId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Created</span>
                    <p className="text-sm">{new Date(agent.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Last Updated</span>
                    <p className="text-sm">{new Date(agent.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#111111] mb-4">Allowed Tools ({agent.allowedTools.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.allowedTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#111111] mb-4">Execution Traces ({traces.length})</h3>
              {traces.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No execution traces yet. Run the agent to see traces.</p>
              ) : (
                <div className="space-y-3">
                  {traces.map((trace) => (
                    <div
                      key={trace.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#F54E00] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">Iteration {trace.loopIteration}</span>
                          <span className={`font-mono text-sm ${getLoopStateColor(trace.loopState)}`}>
                            {trace.loopState}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(trace.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {trace.selectedTool && (
                        <p className="text-sm mb-1">
                          <span className="font-semibold">Tool:</span> <span className="font-mono">{trace.selectedTool}</span>
                        </p>
                      )}
                      {trace.toolRationale && (
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">Rationale:</span> {trace.toolRationale}
                        </p>
                      )}
                      {trace.durationMs && (
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Duration:</span> {trace.durationMs}ms
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#111111] mb-4">Policy Configuration</h3>
              <pre className="bg-gray-100 border border-gray-300 rounded p-4 overflow-x-auto text-sm font-mono">
                {JSON.stringify(agent.policyConfig, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#111111] mb-4">Memory State</h3>
              <pre className="bg-gray-100 border border-gray-300 rounded p-4 overflow-x-auto text-sm font-mono">
                {JSON.stringify(agent.memoryState, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
