'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, AlertCircleIcon, ToolRegistryIcon } from '@/components/icons';
import { ToolsIcon as ToolsProductIcon } from '@/components/icons/product/ToolsIcon';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'inactive';
  usageCount: number;
  avgDuration: number;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([
    { id: '1', name: 'search_web', category: 'search', description: 'Web search using external API', status: 'active', usageCount: 1247, avgDuration: 320 },
    { id: '2', name: 'search_docs', category: 'search', description: 'Internal documentation search', status: 'active', usageCount: 834, avgDuration: 180 },
    { id: '3', name: 'calculator', category: 'compute', description: 'Mathematical calculations', status: 'active', usageCount: 2103, avgDuration: 45 },
    { id: '4', name: 'code_executor', category: 'compute', description: 'Execute code in sandboxed environment', status: 'active', usageCount: 567, avgDuration: 890 },
    { id: '5', name: 'database_read', category: 'database', description: 'Read from PostgreSQL', status: 'active', usageCount: 3421, avgDuration: 120 },
    { id: '6', name: 'database_write', category: 'database', description: 'Write to PostgreSQL', status: 'inactive', usageCount: 0, avgDuration: 0 },
    { id: '7', name: 'api_call', category: 'integration', description: 'Make HTTP API calls', status: 'active', usageCount: 892, avgDuration: 450 },
    { id: '8', name: 'file_read', category: 'file', description: 'Read file contents', status: 'active', usageCount: 456, avgDuration: 78 },
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))];
  
  const filteredTools = tools
    .filter(tool => filter === 'all' || tool.status === filter)
    .filter(tool => categoryFilter === 'all' || tool.category === categoryFilter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      default: return <ToolRegistryIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-4">
            <ToolsProductIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">Tool Registry</h1>
              <p className="text-gray-700 text-base max-w-3xl mt-1">
                Available tools agents can invoke. Configure permissions and monitor usage.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filter === status
                    ? 'bg-[#F54E00] text-white border-2 border-[#F54E00]'
                    : 'bg-white text-[#111111] border-2 border-black hover:bg-gray-100'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ToolRegistryIcon className="w-5 h-5 text-[#F54E00]" />
              <div className="text-2xl font-bold text-[#111111]">{tools.length}</div>
            </div>
            <div className="text-sm text-gray-600">Total Tools</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{tools.filter(t => t.status === 'active').length}</div>
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon className="w-5 h-5 text-gray-600" />
              <div className="text-2xl font-bold text-gray-600">{tools.filter(t => t.status === 'inactive').length}</div>
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ToolRegistryIcon className="w-5 h-5 text-[#5EEAD4]" />
              <div className="text-2xl font-bold text-blue-600">{tools.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-600">Total Calls</div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gray-100 border-2 border-black rounded-lg p-3">
                    {getCategoryIcon(tool.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#111111] font-mono">{tool.name}</h3>
                      {tool.status === 'active' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 border-2 border-green-200 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertCircleIcon className="w-3 h-3" />
                          INACTIVE
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-mono">
                        {tool.category}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{tool.description}</p>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#5EEAD4] inline-block" />
                        <span className="text-gray-600">Usage:</span>
                        <span className="font-bold text-[#111111]">{tool.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C084FC] inline-block" />
                        <span className="text-gray-600">Avg Duration:</span>
                        <span className="font-bold text-[#111111]">{tool.avgDuration}ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#93C5FD] inline-block" />
                        <span className="text-gray-600">Category:</span>
                        <span className="font-bold text-[#111111]">{tool.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const updated = tools.map(t =>
                      t.id === tool.id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
                    );
                    setTools(updated as any);
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    tool.status === 'active'
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-[#F54E00] hover:bg-[#E24600] text-white'
                  }`}
                >
                  {tool.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
            <ToolsProductIcon className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-bold text-[#111111] mb-2">No tools found</h3>
            <p className="text-gray-600">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
