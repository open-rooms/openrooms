'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { WorkflowEmptyState } from '@/components/empty-state'
import { AgentIcon } from '@/components/icons/AgentIcon'
import { WorkflowIcon as CustomWorkflowIcon } from '@/components/icons/WorkflowIcon'
import { ChevronRightIcon, PlayIcon } from '@/components/icons'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const data = await api.getWorkflows()
        setWorkflows(data.workflows)
      } catch (error) {
        console.error('Failed to load workflows:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
  }, [])

  return (
    <div>
      <Header 
        title="Workflows" 
        subtitle={`${workflows.length} workflow templates`}
        actions={
          <Button asChild>
            <Link href="/workflows?action=create">
              <PlayIcon className="w-4 h-4 mr-2" />
              New Workflow
            </Link>
          </Button>
        }
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-surface-active border-t-brand rounded-full animate-spin mx-auto mb-4" />
              <span className="text-text-secondary">Loading workflows...</span>
            </div>
          ) : workflows.length === 0 ? (
            <WorkflowEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {workflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/workflows/${workflow.id}`}
                  className="block"
                >
                  <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <CustomWorkflowIcon className="w-12 h-12" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text-primary truncate mb-2">
                            {workflow.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-surface-active text-text-secondary rounded-lg font-mono font-semibold">
                              v{workflow.version}
                            </span>
                            <span className={`px-2 py-1 rounded-lg font-semibold ${
                              workflow.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {workflow.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}

                      <div className="pt-4 border-t border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Initial Node</span>
                          <span className="text-text-primary font-mono">{workflow.initialNodeId}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Updated</span>
                          <span className="text-text-primary">{formatRelativeTime(workflow.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="flex items-center justify-between text-sm font-semibold text-brand group-hover:text-brand/80 transition-colors">
                          <span>View Workflow</span>
                          <ChevronRightIcon className="w-4 h-4" />
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
