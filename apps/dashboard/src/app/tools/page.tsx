'use client';

import { useState, useEffect } from 'react';
import { getTools, type Tool } from '@/lib/api';
import { CheckCircleIcon, AlertCircleIcon, ToolRegistryIcon } from '@/components/icons';
import { ToolsIcon as ToolsProductIcon } from '@/components/icons/product/ToolsIcon';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      setLoading(true);
      setError(null);
      const data = await getTools();
      setTools(data.tools || []);
    } catch (err) {
      setError('Could not reach API. Is the backend running on port 3001?');
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))];

  const filteredTools = tools
    .filter(tool => categoryFilter === 'all' || tool.category === categoryFilter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'compute': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'database': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'integration': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'file': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-6">
          <ToolsProductIcon className="w-20 h-20 flex-shrink-0" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">Tool Registry</h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Available tools agents can invoke. Each tool is validated against agent policy before execution.
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm font-medium">{error}</span>
            <button onClick={fetchTools} className="ml-auto text-sm font-bold text-red-600 hover:text-red-800">Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tools', value: tools.length, color: 'text-[#111111]' },
            { label: 'Categories', value: categories.length - 1, color: 'text-blue-600' },
            { label: 'Avg Timeout', value: tools.length ? `${Math.round(tools.reduce((a, t) => a + t.timeout, 0) / tools.length / 1000)}s` : '—', color: 'text-purple-600' },
            { label: 'Showing', value: filteredTools.length, color: 'text-[#5EEAD4]' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border-2 border-black rounded-lg p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                categoryFilter === cat
                  ? 'bg-[#F54E00] text-white border-2 border-[#F54E00]'
                  : 'bg-white text-[#111111] border-2 border-black hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#F54E00] mb-4" />
            <p className="text-gray-600">Loading tools from registry...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredTools.length === 0 && (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
            <ToolsProductIcon className="w-20 h-20 mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-[#111111] mb-2">No tools registered</h3>
            <p className="text-gray-600 mb-2">The tool registry is empty. Tools are registered by the runtime when the API starts.</p>
            <p className="text-sm text-gray-500">Start the API server to seed built-in tools.</p>
          </div>
        )}

        {/* Tools list */}
        {!loading && filteredTools.length > 0 && (
          <div className="grid gap-4">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg hover:border-[#5EEAD4] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon block */}
                    <div className="bg-[#5EEAD4] bg-opacity-20 border-2 border-black rounded-lg p-3 group-hover:scale-105 transition-transform duration-200">
                      <ToolRegistryIcon className="w-6 h-6 text-[#5EEAD4]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-bold text-[#111111] font-mono">{tool.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getCategoryColor(tool.category)}`}>
                          {tool.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono text-gray-500 bg-gray-100">
                          v{tool.version}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3 text-sm">{tool.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Timeout: <strong className="text-[#111111]">{tool.timeout / 1000}s</strong></span>
                        <span>Registered: <strong className="text-[#111111]">{new Date(tool.createdAt).toLocaleDateString()}</strong></span>
                        {Array.isArray(tool.parameters) && tool.parameters.length > 0 && (
                          <span>Parameters: <strong className="text-[#111111]">{tool.parameters.length}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
