import Link from 'next/link';
import { fetchTools } from '@/lib/api';

export default async function ToolsPage() {
  const data = await fetchTools();
  const tools = data.tools || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Tools</h1>

        {tools.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">No tools registered</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tools.map((tool: any) => (
              <div
                key={tool.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                  <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">
                    {tool.category}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{tool.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Version: {tool.version}</p>
                  {tool.timeout && <p>Timeout: {tool.timeout}ms</p>}
                  {tool.parameters && (
                    <p className="mt-2">
                      Parameters: {tool.parameters.map((p: any) => p.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
