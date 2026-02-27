import Link from 'next/link';
import { fetchWorkflows } from '@/lib/api';

export default async function WorkflowsPage() {
  const data = await fetchWorkflows();
  const workflows = data.workflows || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Workflows</h1>

        {workflows.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">No workflows found</p>
            <p className="text-gray-500">Create your first workflow to define agent behavior</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow: any) => (
              <div
                key={workflow.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2">{workflow.name}</h2>
                {workflow.description && (
                  <p className="text-gray-400 mb-3">{workflow.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>ID: {workflow.id.slice(0, 8)}</span>
                  <span>Version: {workflow.version}</span>
                  <span>Status: {workflow.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
