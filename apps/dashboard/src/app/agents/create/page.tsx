'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgentsIllustrationIcon } from '@/components/icons';
import { createAgent } from '@/lib/api';

export default function CreateAgentPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    roomId: '',
    allowedTools: '',
    maxLoopIterations: '10',
    maxTokensPerRequest: '4000',
    maxCostPerExecution: '1.0',
    deniedTools: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        goal: formData.goal,
        roomId: formData.roomId || undefined,
        allowedTools: formData.allowedTools
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        policyConfig: {
          maxLoopIterations: parseInt(formData.maxLoopIterations),
          maxTokensPerRequest: parseInt(formData.maxTokensPerRequest),
          maxCostPerExecution: parseFloat(formData.maxCostPerExecution),
          deniedTools: formData.deniedTools
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
        },
      };

      const agent = await createAgent(payload);
      router.push(`/agents/${agent.id}`);
    } catch (error: any) {
      console.error('Failed to create agent:', error);
      alert(`Failed to create agent: ${error.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 animate-fade-in">
          <Link href="/agents" className="text-[#F54E00] hover:underline font-semibold">
            ← Back to agents
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <AgentsIllustrationIcon className="w-10 h-10" />
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">Create Agent</h1>
          </div>
          <p className="text-gray-700">
            Define a new autonomous agent with goals, tools, and execution policies.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-lg p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4 pb-2 border-b-2 border-gray-200">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Agent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="e.g., ResearchAgent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="e.g., Autonomous research and analysis agent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Goal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00] min-h-[100px]"
                    placeholder="e.g., Gather market intelligence and produce weekly reports"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Room ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="Leave empty to create standalone agent"
                  />
                </div>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4 pb-2 border-b-2 border-gray-200">Tool Permissions</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Allowed Tools <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.allowedTools}
                    onChange={(e) => setFormData({ ...formData, allowedTools: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="search, calculator, code_executor (comma-separated)"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Use wildcards like <code className="bg-gray-100 px-1">search_*</code> to match multiple tools
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Denied Tools (Optional)</label>
                  <input
                    type="text"
                    value={formData.deniedTools}
                    onChange={(e) => setFormData({ ...formData, deniedTools: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="database_delete, file_system_* (comma-separated)"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Tools explicitly blocked even if allowed by wildcard
                  </p>
                </div>
              </div>
            </div>

            {/* Policy */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4 pb-2 border-b-2 border-gray-200">Resource Limits</h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Iterations</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxLoopIterations}
                    onChange={(e) => setFormData({ ...formData, maxLoopIterations: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="128000"
                    value={formData.maxTokensPerRequest}
                    onChange={(e) => setFormData({ ...formData, maxTokensPerRequest: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxCostPerExecution}
                    onChange={(e) => setFormData({ ...formData, maxCostPerExecution: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Agent'}
              </button>
              <Link
                href="/agents"
                className="px-6 py-3 bg-white border-2 border-black text-[#111111] font-bold rounded-lg hover:bg-gray-100 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
