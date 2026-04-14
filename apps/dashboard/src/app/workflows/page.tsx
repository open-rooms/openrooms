'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlayIcon, PlusIcon, AlertCircleIcon } from '@/components/icons'
import { WorkflowIcon, AgentIcon, APIIcon, AutomationIcon, LiveRunsIcon } from '@/components/icons/system'
import { createWorkflow, getWorkflows, runWorkflow } from '@/lib/api'

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

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [lastRunId, setLastRunId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  async function loadWorkflows() {
    try {
      const data = await getWorkflows()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
    const interval = setInterval(loadWorkflows, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleCreateWorkflow(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!form.name.trim()) {
      setCreateError('Workflow name is required')
      return
    }
    setCreateError(null)
    setCreating(true)
    try {
      await createWorkflow({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      await loadWorkflows()
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create workflow')
    } finally {
      setCreating(false)
    }
  }

  async function handleRunWorkflow(workflowId: string) {
    setRunningId(workflowId)
    try {
      const result = await runWorkflow(workflowId)
      setLastRunId(result.runId)
    } catch (err: any) {
      alert(`Failed to run workflow: ${err.message || 'Unknown error'}`)
    } finally {
      setRunningId(null)
    }
  }

  async function useTemplate(template: { name: string; description: string }) {
    setCreating(true)
    try {
      await createWorkflow({
        name: `${template.name} Workflow`,
        description: template.description,
        initialNodeId: 'start',
      })
      await loadWorkflows()
    } catch (err: any) {
      alert(`Failed to create from template: ${err.message || 'Unknown error'}`)
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

  const templates = [
    {
      name: 'Simple Sequential',
      description: 'Linear workflow with sequential step execution',
      icon: WorkflowIcon,
      nodes: 5,
      color: 'bg-[#F9F5EF] border-2 border-[#E8E0D0]',
      hoverBorder: 'hover:border-[#93C5FD]',
      accent: '#93C5FD',
    },
    {
      name: 'Parallel Processing',
      description: 'Execute multiple branches concurrently',
      icon: AutomationIcon,
      nodes: 8,
      color: 'bg-[#F9F5EF] border-2 border-[#E8E0D0]',
      hoverBorder: 'hover:border-emerald-400',
      accent: '#6BCB77',
    },
    {
      name: 'Agent Decision',
      description: 'LLM-driven conditional branching',
      icon: AgentIcon,
      nodes: 10,
      color: 'bg-[#F9F5EF] border-2 border-[#E8E0D0]',
      hoverBorder: 'hover:border-teal-400',
      accent: '#5EEAD4',
    },
    {
      name: 'API Integration',
      description: 'External API calls with retry logic',
      icon: APIIcon,
      nodes: 6,
      color: 'bg-[#F9F5EF] border-2 border-[#E8E0D0]',
      hoverBorder: 'hover:border-[#FDBA74]',
      accent: '#FDBA74',
    },
  ]

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      {/* Page header */}
      <div className="border-b border-[#E8E0D0] bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <WorkflowIcon className="w-10 h-10 flex-shrink-0 transition-transform hover:scale-105 duration-200" />
          <div>
            <h1 className="text-xl font-extrabold text-[#111]">Workflows</h1>
            <p className="text-gray-400 text-xs mt-0.5">{workflows.length} orchestration graphs — sequential, parallel, agent-driven</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all"
          style={{ backgroundColor: '#EA580C' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2410C'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA580C'}>
          <PlusIcon className="w-4 h-4" />
          New Workflow
        </button>
      </div>
      
      {lastRunId && (
        <div className="mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-800">
            ✓ Workflow run queued — Run ID: <code className="font-mono text-xs">{lastRunId}</code>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/live-runs" className="text-xs font-bold text-emerald-700 hover:underline">View Live Runs →</Link>
            <button onClick={() => setLastRunId(null)} className="text-emerald-500 hover:text-emerald-700 text-xs">✕</button>
          </div>
        </div>
      )}

      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Workflow Templates */}
          {/* Page hero icon */}
          <div className="flex items-center gap-6 mb-2">
            <WorkflowIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Workflows</h1>
              <p className="text-gray-600 text-sm mt-1">Orchestration templates connecting agents, tools and APIs into structured execution graphs.</p>
            </div>
          </div>

          {showCreate && (
            <Card className="border border-[#DDD5C8] bg-white">
              <CardHeader>
                <CardTitle>Create Workflow</CardTitle>
                <CardDescription>Start a new orchestration graph for rooms and agents.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateWorkflow}>
                  {createError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                      {createError}
                    </div>
                  )}
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Workflow name"
                    className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="px-4 py-2 border border-[#DDD5C8] rounded-lg text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold rounded-lg disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create Workflow'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              Runtime Blueprints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {templates.map((template, idx) => {
                const IconComponent = template.icon
                return (
                  <Card key={idx} className={`${template.color} ${template.hoverBorder} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <IconComponent className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">{template.nodes} nodes</span>
                        <button
                          onClick={() => useTemplate(template)}
                          disabled={creating}
                          className="text-xs px-3 py-1 bg-[#EA580C] text-white rounded font-bold hover:bg-[#C2410C] transition-colors disabled:opacity-50"
                        >
                          {creating ? 'Creating...' : 'Deploy'}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#DED8D2] pb-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-in-out border-b-2 ${
                  filter === status
                    ? 'border-[#EA580C] text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-2 text-xs">{count}</span>
              </button>
            ))}
          </div>

          {/* Workflows List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-surface-active border-t-[#EA580C] rounded-full animate-spin mx-auto mb-4" />
              <span className="text-text-secondary">Loading workflows...</span>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <Card className="border-2 border-dashed border-[#D4C4A8] bg-white">
              <CardContent className="py-12 text-center">
                <WorkflowIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No workflows in this control plane yet</h3>
                <p className="text-sm text-text-secondary mb-6">Create a workflow template to orchestrate rooms, agents, tools, and downstream systems.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold rounded-lg transition-all"
                >
                  Get Started
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="block">
                  <Card className="border border-[#D4C4A8] bg-white hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-[#F9F5EF] rounded-xl flex items-center justify-center flex-shrink-0">
                            <WorkflowIcon className="w-10 h-10" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg text-text-primary truncate">{workflow.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                workflow.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                workflow.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {workflow.status}
                              </span>
                            </div>
                            {workflow.description && (
                              <p className="text-sm text-text-secondary line-clamp-1">{workflow.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                              <span>v{workflow.version}</span>
                              {workflow.nodeCount && <span>{workflow.nodeCount} nodes</span>}
                              <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRunWorkflow(workflow.id)}
                            disabled={runningId === workflow.id}
                            className="px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded transition-colors flex items-center gap-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            {runningId === workflow.id ? 'Starting…' : 'Run'}
                          </button>
                          <Link
                            href={`/rooms?action=create&workflowId=${workflow.id}`}
                            className="px-3 py-2 bg-white border border-[#D4C4A8] hover:border-[#EA580C] text-[#111111] text-xs font-bold rounded transition-colors flex items-center gap-2"
                          >
                            Open in Room
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
