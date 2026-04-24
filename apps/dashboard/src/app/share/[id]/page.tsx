'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getAgents, createRoom, createAgent, createWorkflow } from '@/lib/api'
import type { Agent } from '@/lib/api'
import { AgentIcon, WorkflowIcon, RoomsIcon } from '@/components/icons/system'

export default function ShareRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [cloning, setCloning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cloned, setCloned] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getRoom(roomId),
      getAgents().catch(() => ({ agents: [], count: 0 })),
    ]).then(([roomData, agentsData]) => {
      setRoom(roomData)
      setAgents((agentsData.agents || []).filter((a: Agent) => a.roomId === roomId))
    }).catch(() => setError('Room not found or no longer available.')).finally(() => setLoading(false))
  }, [roomId])

  async function handleClone() {
    const ws = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('openrooms_workspace') || 'null') : null
    if (!ws?.token) {
      router.push(`/login?redirect=/share/${roomId}`)
      return
    }
    setCloning(true); setError(null)
    const uid = Date.now().toString(36).slice(-5)
    try {
      const wf = await createWorkflow({
        name: `${room.name} Flow ${uid}`,
        description: room.description || '',
        nodes: [
          { nodeId: 'start', type: 'START', name: 'Start', config: {} },
          { nodeId: 'end', type: 'END', name: 'End', config: {} },
        ],
      })
      const newRoom = await createRoom({
        name: `${room.name} ${uid}`,
        description: room.description,
        workflowId: wf.id,
      })
      for (const a of agents) {
        await createAgent({
          name: `${a.name} ${uid}`,
          goal: a.goal,
          roomId: newRoom.id,
          allowedTools: a.allowedTools || [],
          policyConfig: (a as any).policyConfig || {},
        })
      }
      setCloned(newRoom.id)
    } catch (e: any) {
      setError(e.message || 'Clone failed')
    } finally { setCloning(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F9F5EF] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin" />
    </div>
  )

  if (error && !room) return (
    <div className="min-h-screen bg-[#F9F5EF] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-lg font-bold text-[#111] mb-2">Room unavailable</p>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Link href="/home" className="px-5 py-2.5 bg-[#EA580C] text-white font-bold rounded-xl text-sm">Go to OpenRooms →</Link>
      </div>
    </div>
  )

  if (cloned) return (
    <div className="min-h-screen bg-[#F9F5EF] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-black text-[#111] mb-1">Room cloned.</p>
        <p className="text-sm text-gray-500 mb-6">It's live in your workspace — agents are ready to deploy.</p>
        <Link href={`/rooms/${cloned}`}
          className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl text-sm transition-colors inline-block">
          Open Room →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9F5EF]">
      {/* Header bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/home" className="text-sm font-bold text-[#EA580C] hover:underline">← OpenRooms</Link>
          <span className="text-xs text-gray-400 font-mono">shared room</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Room card */}
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-start gap-4">
            <RoomsIcon className="w-14 h-14 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[#111]">{room?.name}</h1>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full font-mono">
                  {room?.status || 'IDLE'}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{room?.description || 'An autonomous AI system built with OpenRooms.'}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-black text-[#111]">{agents.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Agents</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-black text-[#111]">∞</p>
              <p className="text-xs text-gray-400 mt-0.5">Memory</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#111]">Live</p>
              <p className="text-xs text-gray-400 mt-0.5">Webhook</p>
            </div>
          </div>
        </div>

        {/* Agents list */}
        {agents.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Agents in this Room</h2>
            <div className="space-y-3">
              {agents.map(a => (
                <div key={a.id} className="bg-white border border-[#D4C4A8] rounded-xl p-4 flex items-start gap-3">
                  <AgentIcon className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111] truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.goal}</p>
                    {(a.allowedTools || []).length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {(a.allowedTools || []).slice(0, 4).map((t: string) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-mono">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow note */}
        <div className="bg-white border border-[#D4C4A8] rounded-xl p-4 flex items-center gap-3">
          <WorkflowIcon className="w-10 h-10 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#111]">Workflow bound</p>
            <p className="text-xs text-gray-500 mt-0.5">Agents run inside a deterministic execution graph. Clone to see and modify it.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#111111] rounded-2xl p-8 text-center">
          <p className="text-white font-black text-xl mb-2">Clone this Room to your workspace</p>
          <p className="text-gray-400 text-sm mb-6">Every agent, goal, and tool — copied in seconds. You own it from here.</p>

          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-900/40 border border-red-500/40 rounded-lg text-xs text-red-300">{error}</div>
          )}

          <button onClick={handleClone} disabled={cloning}
            className="px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white font-black rounded-xl text-sm transition-all flex items-center gap-2 mx-auto">
            {cloning
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Cloning…</>
              : 'Clone to my workspace →'
            }
          </button>
          <p className="text-gray-600 text-xs mt-4">Free. No credit card. Login required.</p>
        </div>

      </div>
    </div>
  )
}
