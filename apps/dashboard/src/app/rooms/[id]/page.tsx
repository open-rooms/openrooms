'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchRoom, fetchRoomLogs, runRoom } from '@/lib/api';

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      const [roomData, logsData] = await Promise.all([
        fetchRoom(params.id),
        fetchRoomLogs(params.id),
      ]);
      setRoom(roomData);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRun() {
    try {
      await runRoom(params.id);
      alert('Room execution started');
      setTimeout(loadData, 1000);
    } catch (error) {
      alert('Failed to run room');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="container mx-auto">Loading...</div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="container mx-auto">Room not found</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/rooms" className="text-blue-400 hover:text-blue-300">
            ← Back to Rooms
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{room.name}</h1>
              {room.description && <p className="text-gray-400">{room.description}</p>}
            </div>
            <button
              onClick={handleRun}
              disabled={room.status === 'RUNNING'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {room.status === 'RUNNING' ? 'Running...' : 'Run Room'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="font-semibold">{room.status}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Room ID</p>
              <p className="font-mono text-sm">{room.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Workflow ID</p>
              <p className="font-mono text-sm">{room.workflowId.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Created</p>
              <p className="text-sm">{new Date(room.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Execution Logs</h2>
          
          {logs.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400">No logs yet</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 max-h-[600px] overflow-y-auto">
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded ${
                      log.level === 'ERROR'
                        ? 'bg-red-900/30 border-l-4 border-red-500'
                        : log.level === 'WARN'
                        ? 'bg-yellow-900/30 border-l-4 border-yellow-500'
                        : 'bg-gray-800 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-gray-500">{log.eventType}</span>
                    </div>
                    <p className="text-gray-100">{log.message}</p>
                    {log.duration && (
                      <span className="text-xs text-gray-500">Duration: {log.duration}ms</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
