import Link from 'next/link';
import { fetchRooms } from '@/lib/api';

export default async function RoomsPage() {
  const data = await fetchRooms();
  const rooms = data.rooms || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Rooms</h1>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Create Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">No rooms found</p>
            <p className="text-gray-500">Create your first room to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room: any) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
                      {room.description && (
                        <p className="text-gray-400 mb-3">{room.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>ID: {room.id.slice(0, 8)}</span>
                        <span>Workflow: {room.workflowId.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          room.status === 'COMPLETED'
                            ? 'bg-green-900 text-green-300'
                            : room.status === 'RUNNING'
                            ? 'bg-blue-900 text-blue-300'
                            : room.status === 'FAILED'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
