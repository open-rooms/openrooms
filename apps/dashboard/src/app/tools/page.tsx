'use client';

import { useState, useEffect } from 'react';
import { getTools, createTool, deleteTool, type Tool } from '@/lib/api';
import { CheckCircleIcon, AlertCircleIcon, PlusIcon } from '@/components/icons';
import { ToolIcon } from '@/components/icons/system';

const BUILTIN_IDS = new Set([
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
]);

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ name: '', description: '', category: 'API' as 'API'|'Webhook'|'Script'|'SDK', url: '', method: 'POST' });

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

  async function handleAddTool(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return setAddError('Name is required');
    setAdding(true);
    setAddError(null);
    try {
      await createTool({
        name: addForm.name.trim(),
        description: addForm.description.trim() || addForm.name,
        category: addForm.category,
        url: addForm.url.trim() || undefined,
        method: addForm.method,
      });
      setShowAdd(false);
      setAddForm({ name: '', description: '', category: 'API', url: '', method: 'POST' });
      await fetchTools();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add tool');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(toolId: string, toolName: string) {
    if (!confirm(`Delete tool "${toolName}"? Agents using it will need to be updated.`)) return;
    try {
      await deleteTool(toolId);
      await fetchTools();
    } catch (err: any) {
      alert(err.message || 'Failed to delete tool');
    }
  }

  const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))];

  const filteredTools = tools
    .filter(tool => categoryFilter === 'all' || tool.category === categoryFilter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EXTERNAL_API': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPUTATION': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DATA_ACCESS': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'CUSTOM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'search': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'compute': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5EF] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-6">
            <ToolIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">Tool Registry</h1>
              <p className="text-gray-600 mt-1 max-w-2xl">
                Available tools agents can invoke. Each tool is validated against agent policy before execution.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Add Tool
          </button>
        </div>

        {/* Add Tool Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
            <div className="relative bg-white border border-[#DDD5C8] rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between p-6 border-b-2 border-black">
                <h2 className="text-xl font-bold text-[#111111]">Register Tool</h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 font-bold text-lg">×</button>
              </div>
              <form onSubmit={handleAddTool} className="p-6 space-y-4">
                {addError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{addError}</div>
                )}
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-1">Name *</label>
                  <input
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. my_webhook"
                    className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-1">Description</label>
                  <input
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What this tool does"
                    className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111111] mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={e => setAddForm(f => ({ ...f, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm bg-white"
                  >
                    <option value="API">API</option>
                    <option value="Webhook">Webhook</option>
                    <option value="Script">Script</option>
                    <option value="SDK">SDK</option>
                  </select>
                </div>
                {(addForm.category === 'API' || addForm.category === 'Webhook') && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-[#111111] mb-1">URL</label>
                      <input
                        value={addForm.url}
                        onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))}
                        placeholder="https://api.example.com/webhook"
                        className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111111] mb-1">Method</label>
                      <select
                        value={addForm.method}
                        onChange={e => setAddForm(f => ({ ...f, method: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm bg-white"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-[#DDD5C8] rounded-lg text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white rounded-lg text-sm font-bold">
                    {adding ? 'Adding...' : 'Add Tool'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
            <div key={stat.label} className="bg-white border border-[#DDD5C8] rounded-lg p-4">
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
                  ? 'bg-[#EA580C] text-white border-2 border-[#EA580C]'
                  : 'bg-white text-[#111111] border border-[#DDD5C8] hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#EA580C] mb-4" />
            <p className="text-gray-600">Loading tools from registry...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredTools.length === 0 && (
          <div className="bg-white border border-[#DDD5C8] rounded-lg p-12 text-center">
            <ToolIcon className="w-20 h-20 mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-[#111111] mb-2">No tools in this filter</h3>
            <p className="text-gray-600 mb-6">
              {categoryFilter === 'all' ? 'Add a custom tool or start the API to load built-in tools.' : 'Try a different category.'}
            </p>
            {categoryFilter === 'all' && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-lg transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                Add Tool
              </button>
            )}
          </div>
        )}

        {/* Tools list */}
        {!loading && filteredTools.length > 0 && (
          <div className="grid gap-4">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className="bg-white border border-[#DDD5C8] rounded-lg p-6 hover:shadow-lg hover:border-[#5EEAD4] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon block */}
                    <div className="bg-[#5EEAD4] bg-opacity-20 border border-[#DDD5C8] rounded-lg p-3 group-hover:scale-105 transition-transform duration-200">
                      <ToolIcon className="w-6 h-6 text-[#5EEAD4]" />
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

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">Available</span>
                    {!BUILTIN_IDS.has(tool.id) && (
                      <button
                        onClick={() => handleDelete(tool.id, tool.name)}
                        className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    )}
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
