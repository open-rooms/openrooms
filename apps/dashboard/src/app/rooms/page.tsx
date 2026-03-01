'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { RoomEmptyState } from '@/components/empty-state'
import { RoomsIcon } from '@/components/icons/RoomsIcon'
import { ChevronRightIcon, PlayIcon } from '@/components/icons'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await api.getRooms()
        setRooms(data.rooms)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
    const interval = setInterval(loadRooms, 3000)
    return () => clearInterval(interval)
  }, [])

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true
    return room.status === filter
  })

  const statusCounts = {
    all: rooms.length,
    RUNNING: rooms.filter(r => r.status === 'RUNNING').length,
    COMPLETED: rooms.filter(r => r.status === 'COMPLETED').length,
    FAILED: rooms.filter(r => r.status === 'FAILED').length,
    IDLE: rooms.filter(r => r.status === 'IDLE').length,
  }

  return (
    <div>
      <Header 
        title="Rooms" 
        subtitle={`${rooms.length} execution environments`}
        actions={
          <Button asChild>
            <Link href="/rooms?action=create">
              <PlayIcon className="w-4 h-4 mr-2" />
              New Room
            </Link>
          </Button>
        }
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  filter === status
                    ? 'border-brand text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-2 text-xs">
                  {count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-surface-active border-t-brand rounded-full animate-spin mx-auto mb-4" />
              <span className="text-text-secondary">Loading rooms...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <RoomEmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="block"
                >
                  <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <RoomsIcon className="w-12 h-12" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-text-primary truncate">
                                {room.name}
                              </h3>
                              <StatusBadge status={room.status} />
                              {room.status === 'RUNNING' && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                  Active
                                </div>
                              )}
                            </div>
                            
                            {room.description && (
                              <p className="text-sm text-text-secondary mb-3">{room.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span className="font-mono">ID: {room.id.slice(0, 8)}...</span>
                              <span>•</span>
                              <span className="font-mono">Workflow: {room.workflowId.slice(0, 8)}...</span>
                              <span>•</span>
                              <span>Updated {formatRelativeTime(room.updatedAt)}</span>
                              {room.completedAt && (
                                <>
                                  <span>•</span>
                                  <span>Completed {formatRelativeTime(room.completedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ChevronRightIcon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-200" />
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
