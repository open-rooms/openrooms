'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api, type Workflow, type WorkflowNode } from '@/lib/api'
import { WorkflowIcon as WorkflowProductIcon } from '@/components/icons/product/WorkflowIcon'
import { PlusIcon, ChevronRightIcon } from '@/components/icons'

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflowId = params.id as string
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [workflowData, nodesData] = await Promise.all([
          api.getWorkflow(workflowId),
          api.getWorkflowNodes(workflowId).catch(() => ({ nodes: [] })),
        ])
        setWorkflow(workflowData)
        setNodes(nodesData.nodes || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workflowId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin" />
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#F9F5EF] p-8">
        <Link href="/workflows" className="text-[#EA580C] font-semibold hover:underline">← Back to workflows</Link>
        <div className="mt-8 text-gray-600">Workflow not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F5EF]">
      <Header
        title={workflow.name}
        subtitle={`Workflow ${workflow.id.slice(0, 8)}...`}
        actions={
          <Link
            href={`/rooms?action=create&workflowId=${workflow.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold rounded-lg transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            Create Room from Workflow
          </Link>
        }
      />

      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-5">
            <WorkflowProductIcon className="w-20 h-20" />
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">{workflow.name}</h1>
              {workflow.description && <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>}
            </div>
          </div>

          <Card className="border border-[#D4C4A8] bg-white">
            <CardHeader>
              <CardTitle>Execution Graph</CardTitle>
              <CardDescription>{nodes.length} nodes</CardDescription>
            </CardHeader>
            <CardContent>
              {nodes.length === 0 ? (
                <p className="text-sm text-gray-500">No explicit nodes saved yet. This workflow may be using auto-generated START/END nodes.</p>
              ) : (
                <div className="space-y-3">
                  {nodes.map((node) => (
                    <div key={node.id} className="p-3 rounded-lg border border-[#D4C4A8] bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{node.name}</div>
                        <div className="text-xs text-gray-500">Type: {node.type}</div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

