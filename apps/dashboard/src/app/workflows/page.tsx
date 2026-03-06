'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlayIcon, ChevronRightIcon, PlusIcon, SequentialWorkflowIcon, ParallelWorkflowIcon, AgentDecisionIcon, APIIntegrationIcon } from '@/components/icons'
import { WorkflowIcon as WorkflowProductIcon } from '@/components/icons/product/WorkflowIcon'

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

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const response = await fetch('http://localhost:3001/api/workflows')
        const data = await response.json()
        setWorkflows(data.workflows || [])
      } catch (error) {
        console.error('Failed to load workflows:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
    const interval = setInterval(loadWorkflows, 5000)
    return () => clearInterval(interval)
  }, [])

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
      icon: SequentialWorkflowIcon,
      nodes: 5,
      color: 'bg-purple-50 border-2 border-purple-200',
      hoverBorder: 'hover:border-[#93C5FD]',
      accent: '#93C5FD',
    },
    {
      name: 'Parallel Processing',
      description: 'Execute multiple branches concurrently',
      icon: ParallelWorkflowIcon,
      nodes: 8,
      color: 'bg-emerald-50 border-2 border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      accent: '#6BCB77',
    },
    {
      name: 'Agent Decision',
      description: 'LLM-driven conditional branching',
      icon: AgentDecisionIcon,
      nodes: 10,
      color: 'bg-teal-50 border-2 border-teal-200',
      hoverBorder: 'hover:border-teal-400',
      accent: '#5EEAD4',
    },
    {
      name: 'API Integration',
      description: 'External API calls with retry logic',
      icon: APIIntegrationIcon,
      nodes: 6,
      color: 'bg-orange-50 border-2 border-orange-200',
      hoverBorder: 'hover:border-[#FDBA74]',
      accent: '#FDBA74',
    },
  ]

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header 
        title="Workflows" 
        subtitle={`${workflows.length} orchestration templates`}
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-lg transition-all duration-200">
            <PlusIcon className="w-4 h-4" />
            New Workflow
          </button>
        }
      />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Workflow Templates */}
          {/* Page hero icon */}
          <div className="flex items-center gap-6 mb-2">
            <WorkflowProductIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Workflows</h1>
              <p className="text-gray-600 text-sm mt-1">Orchestration templates connecting agents, tools and APIs into structured execution graphs.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              Quick Start Templates
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
                        <button className="text-xs px-3 py-1 bg-[#F54E00] text-white rounded font-bold hover:bg-[#E24600] transition-colors">
                          Use Template
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
                    ? 'border-[#F54E00] text-text-primary'
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
              <div className="w-8 h-8 border-2 border-surface-active border-t-[#F54E00] rounded-full animate-spin mx-auto mb-4" />
              <span className="text-text-secondary">Loading workflows...</span>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <Card className="border-2 border-dashed border-[#D4C4A8] bg-[#F5F1E8]">
              <CardContent className="py-12 text-center">
                <WorkflowListIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No workflows yet</h3>
                <p className="text-sm text-text-secondary mb-6">Create your first workflow from a template</p>
                <button className="px-6 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-lg transition-all">
                  Get Started
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredWorkflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/workflows/${workflow.id}`}
                  className="block"
                >
                  <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <WorkflowListIcon className="w-6 h-6 text-purple-600" />
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
                            onClick={(e) => {
                              e.preventDefault()
                              alert('Execute workflow: ' + workflow.name)
                            }}
                            className="px-3 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-xs font-bold rounded transition-colors flex items-center gap-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Execute
                          </button>
                          <ChevronRightIcon className="w-5 h-5 text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
