import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">OpenRooms</h1>
          <p className="text-gray-400">Agent Orchestration Control Plane</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rooms Card */}
          <Link href="/rooms" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Rooms</h2>
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-gray-400">
                Manage execution environments where agents run and workflows execute
              </p>
            </div>
          </Link>

          {/* Workflows Card */}
          <Link href="/workflows" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Workflows</h2>
                <svg
                  className="w-8 h-8 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-400">
                Define deterministic state machines for agent behavior
              </p>
            </div>
          </Link>

          {/* Tools Card */}
          <Link href="/tools" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Tools</h2>
                <svg
                  className="w-8 h-8 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-400">
                Browse and manage extensible tool plugins for agents
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <ol className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                1
              </span>
              <span>Create a workflow with deterministic state transitions</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                2
              </span>
              <span>Create a room linked to your workflow</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                3
              </span>
              <span>Execute the room and monitor logs in real-time</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
