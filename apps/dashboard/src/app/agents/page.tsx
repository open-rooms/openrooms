'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AgentsIllustrationIcon, AgentListIcon } from '@/components/icons';

interface Agent {
  id: string;
  name: string;
  description?: string;
  goal: string;
  version: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  loopState: string;
  allowedTools: string[];
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents
    .filter(agent => filter === 'ALL' || agent.status === filter)
    .filter(agent => 
      searchTerm === '' || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLoopStateColor = (state: string) => {
    switch (state) {
      case 'IDLE': return 'text-gray-500';
      case 'PERCEIVING': return 'text-blue-500';
      case 'REASONING': return 'text-purple-500';
      case 'SELECTING_TOOL': return 'text-indigo-500';
      case 'EXECUTING_TOOL': return 'text-orange-500';
      case 'UPDATING_MEMORY': return 'text-teal-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <AgentsIllustrationIcon className="w-10 h-10" />
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">Agents</h1>
          </div>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl">
            Autonomous AI units with memory, tools, and execution policies. Agents perceive, reason, select tools, and update state in deterministic loops.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search agents by name or goal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-[#111111] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F54E00] transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  filter === status
                    ? 'bg-[#F54E00] text-white border-2 border-[#F54E00]'
                    : 'bg-white text-[#111111] border-2 border-black hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <Link 
            href="/agents/create"
            className="px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-xl text-center whitespace-nowrap"
          >
            + Create Agent
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-2xl font-bold text-[#111111]">{agents.length}</div>
            <div className="text-sm text-gray-600">Total Agents</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{agents.filter(a => a.status === 'ACTIVE').length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{agents.filter(a => a.status === 'PAUSED').length}</div>
            <div className="text-sm text-gray-600">Paused</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">{agents.filter(a => a.status === 'ARCHIVED').length}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>

        {/* Agent List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54E00]"></div>
            <p className="mt-4 text-gray-600">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
            <AgentListIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-[#111111] mb-2">No agents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'ALL' 
                ? 'Try adjusting your filters or search term.'
                : 'Create your first autonomous agent to get started.'}
            </p>
            {!searchTerm && filter === 'ALL' && (
              <Link 
                href="/agents/create"
                className="inline-block px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105"
              >
                + Create First Agent
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {filteredAgents.map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] group"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#F54E00] transition-colors truncate">
                        {agent.name}
                      </h3>
                      <span className="text-sm text-gray-500 font-mono whitespace-nowrap">v{agent.version}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>

                    {/* Goal */}
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      <span className="font-semibold text-gray-900">Goal:</span> {agent.goal}
                    </p>

                    {/* Description */}
                    {agent.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">{agent.description}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Loop State:</span>
                        <span className={`font-mono ${getLoopStateColor(agent.loopState)}`}>
                          {agent.loopState}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Tools:</span>
                        <span className="font-mono">{agent.allowedTools.length}</span>
                      </div>
                      {agent.roomId && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Room:</span>
                          <span className="font-mono text-xs">{agent.roomId.substring(0, 8)}...</span>
                        </div>
                      )}
                      {agent.lastExecutedAt && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Last Run:</span>
                          <span>{new Date(agent.lastExecutedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-[#F54E00] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
