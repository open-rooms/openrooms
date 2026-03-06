'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { api, type Workflow } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { RoomsIcon } from '@/components/icons/RoomsIcon'
import { ChevronRightIcon, PlayIcon, PlusIcon, AlertCircleIcon, CheckCircleIcon } from '@/components/icons'

// ─── Create Room Modal ────────────────────────────────────────────────────────
function CreateRoomModal({
  defaultWorkflowId,
  onClose,
  onCreated,
}: {
  defaultWorkflowId?: string
  onClose: () => void
  onCreated: () => void
}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [form, setForm] = useState({ name: '', description: '', workflowId: defaultWorkflowId || '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getWorkflows().then(d => setWorkflows(d.workflows || [])).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    if (!form.workflowId) return setError('Select a workflow to bind this room to')
    setCreating(true)
    setError(null)
    try {
      await api.createRoom({ name: form.name.trim(), description: form.description.trim() || undefined, workflowId: form.workflowId })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create room — is the API running?')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border-2 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">New Room</h2>
            <p className="text-sm text-gray-500 mt-0.5">An isolated execution environment for your workflow</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 font-bold text-lg">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Room Name */}
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1">Room Name *</label>
            <input
              type="text"
              placeholder="e.g. Market Analysis Run #1"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:border-[#F54E00] transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1">Description <span className="font-normal text-gray-400">(optional)</span></label>
            <textarea
              placeholder="What will this room do?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:border-[#F54E00] transition-colors resize-none"
            />
          </div>

          {/* Workflow */}
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-1">Bind to Workflow *</label>
            {workflows.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                No workflows found.{' '}
                <Link href="/workflows" className="font-bold underline" onClick={onClose}>Create a workflow first →</Link>
              </div>
            ) : (
              <select
                value={form.workflowId}
                onChange={e => setForm(f => ({ ...f, workflowId: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:border-[#F54E00] bg-white"
              >
                <option value="">— Select a workflow —</option>
                {workflows.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.status})</option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-black rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || workflows.length === 0}
              className="flex-1 py-2.5 bg-[#F54E00] hover:bg-[#E24600] disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [apiError, setApiError] = useState(false)

  async function loadRooms() {
    try {
      const data = await api.getRooms()
      setRooms(data.rooms || [])
      setApiError(false)
    } catch {
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const action = searchParams.get('action')
    const workflowId = searchParams.get('workflowId')
    if (action === 'create') {
      setShowCreate(true)
      // preselect workflow if provided
      if (workflowId) {
        // handled by modal via key re-mount + prop
      }
    }
  }, [searchParams])

  async function handleRun(e: React.MouseEvent, roomId: string) {
    e.preventDefault()
    e.stopPropagation()
    setRunningId(roomId)
    try {
      await api.runRoom(roomId)
      setTimeout(loadRooms, 800)
    } catch (err: any) {
      alert(`Failed to run: ${err.message}`)
    } finally {
      setRunningId(null)
    }
  }

  async function handleDelete(e: React.MouseEvent, roomId: string, name: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete room "${name}"? This cannot be undone.`)) return
    try {
      await api.deleteRoom(roomId)
      loadRooms()
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  const filteredRooms = rooms.filter(r => filter === 'all' || r.status === filter)
  const statusCounts = {
    all: rooms.length,
    IDLE: rooms.filter(r => r.status === 'IDLE').length,
    RUNNING: rooms.filter(r => r.status === 'RUNNING').length,
    COMPLETED: rooms.filter(r => r.status === 'COMPLETED').length,
    FAILED: rooms.filter(r => r.status === 'FAILED').length,
  }

  const statusColors: Record<string, string> = {
    IDLE: 'text-gray-500',
    RUNNING: 'text-blue-600',
    COMPLETED: 'text-emerald-600',
    FAILED: 'text-red-500',
    PAUSED: 'text-amber-500',
  }

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      {showCreate && (
        <CreateRoomModal
          key={searchParams.get('workflowId') || 'new-room-modal'}
          defaultWorkflowId={searchParams.get('workflowId') || undefined}
          onClose={() => setShowCreate(false)}
          onCreated={loadRooms}
        />
      )}

      <Header
        title="Rooms"
        subtitle={`${rooms.length} execution environment${rooms.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-lg transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            New Room
          </button>
        }
      />

      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* API error */}
          {apiError && !loading && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">
                API unreachable — start the backend with <code className="bg-red-100 px-1 rounded">pnpm dev --filter @openrooms/api</code>
              </span>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-2 border-b-2 border-[#D4C4A8] pb-2 flex-wrap">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                  filter === status
                    ? 'border-[#F54E00] text-[#F54E00]'
                    : 'border-transparent text-gray-500 hover:text-[#111111]'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-1.5 text-xs font-bold">{count}</span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#D4C4A8] border-t-[#F54E00] rounded-full animate-spin mx-auto mb-4" />
              <span className="text-gray-500 text-sm">Loading rooms...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <RoomsIcon className="w-20 h-20 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-[#111111] mb-2">
                {filter === 'all' ? 'No execution rooms yet' : `No ${filter.toLowerCase()} rooms`}
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Rooms are isolated execution environments that bind workflow graphs to live agent/runtime orchestration.
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Your First Room
                </button>
              )}
            </div>
          ) : (
            /* Room list */
            <div className="grid grid-cols-1 gap-4">
              {filteredRooms.map(room => (
                <Link key={room.id} href={`/rooms/${room.id}`} className="block group">
                  <div className="bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-xl p-5 hover:border-[#F54E00] hover:shadow-lg hover:bg-white transition-all duration-200">
                    <div className="flex items-center justify-between gap-4">

                      {/* Left: icon + info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 ${
                          room.status === 'RUNNING' ? 'bg-blue-100' :
                          room.status === 'COMPLETED' ? 'bg-emerald-100' :
                          room.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <RoomsIcon className="w-7 h-7" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-[#111111] truncate">{room.name}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              room.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              room.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                              room.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-gray-100 text-gray-600 border-gray-300'
                            }`}>
                              {room.status === 'RUNNING' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse" />}
                              {room.status}
                            </span>
                          </div>
                          {room.description && (
                            <p className="text-xs text-gray-500 mb-1 truncate">{room.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono flex-wrap">
                            <span>{room.id.slice(0, 8)}…</span>
                            <span>·</span>
                            <span>workflow {room.workflowId.slice(0, 8)}…</span>
                            <span>·</span>
                            <span>{formatRelativeTime(room.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.preventDefault()}>
                        {(room.status === 'IDLE' || room.status === 'COMPLETED' || room.status === 'FAILED') && (
                          <button
                            onClick={e => handleRun(e, room.id)}
                            disabled={runningId === room.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F54E00] hover:bg-[#E24600] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            {runningId === room.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <PlayIcon className="w-3 h-3" />
                            )}
                            Run
                          </button>
                        )}
                        {room.status === 'RUNNING' && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 text-xs font-bold">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            Running
                          </span>
                        )}
                        <button
                          onClick={e => handleDelete(e, room.id, room.name)}
                          className="px-3 py-1.5 border-2 border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-400 text-xs font-bold rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#F54E00] transition-colors ml-1" />
                      </div>

                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
