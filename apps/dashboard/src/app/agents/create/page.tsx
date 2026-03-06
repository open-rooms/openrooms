'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgentsIllustrationIcon } from '@/components/icons';
import { createAgent, getTools, runAgent } from '@/lib/api';

interface Tool { id: string; name: string; description: string; category: string; }

const MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'claude-3-haiku-20240307', 'claude-3-sonnet-20240229'];
const PROVIDERS = ['openai', 'anthropic', 'simulation'];

const GOAL_TEMPLATES = [
  { label: 'Market Research', goal: 'Fetch live cryptocurrency prices, analyse market trends, and produce a concise investment sentiment report with a score from 1 to 10.' },
  { label: 'Tech Scouting', goal: 'Find the top 5 trending open-source repositories on GitHub this week, identify dominant themes, and summarise what the developer community is building.' },
  { label: 'Data Analyst', goal: 'Retrieve market overview data, calculate percentage changes and momentum indicators, and output a structured JSON report with key findings.' },
  { label: 'Custom', goal: '' },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [goalTemplate, setGoalTemplate] = useState(0);
  const [runAfterCreate, setRunAfterCreate] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: GOAL_TEMPLATES[0]!.goal,
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    maxLoopIterations: '5',
    maxCostPerExecution: '0.50',
  });

  useEffect(() => {
    getTools().then(d => {
      setTools(d.tools || []);
      // Pre-select all tools
      setSelectedTools((d.tools || []).map((t: Tool) => t.name));
    }).catch(() => setTools([])).finally(() => setLoadingTools(false));
  }, []);

  const toggleTool = (name: string) => {
    setSelectedTools(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const applyTemplate = (idx: number) => {
    setGoalTemplate(idx);
    if (idx < GOAL_TEMPLATES.length - 1) {
      setFormData(f => ({ ...f, goal: GOAL_TEMPLATES[idx]!.goal }));
    }
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'HTTP_API' || cat === 'EXTERNAL_API') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (cat === 'COMPUTATION') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTools.length === 0) { alert('Select at least one tool'); return; }
    setCreating(true);

    try {
      const agent = await createAgent({
        name: formData.name,
        description: formData.description || undefined,
        goal: formData.goal,
        allowedTools: selectedTools,
        policyConfig: {
          provider: formData.provider,
          model: formData.model,
          maxLoopIterations: parseInt(formData.maxLoopIterations),
          maxCostPerExecution: parseFloat(formData.maxCostPerExecution),
          deniedTools: [],
        },
      });

      if (runAfterCreate) {
        // Create and immediately run
        try {
          const run = await runAgent(agent.id, { maxIterations: parseInt(formData.maxLoopIterations) });
          router.push(`/live-runs?highlight=${run.runId}`);
        } catch {
          router.push(`/agents/${agent.id}`);
        }
      } else {
        router.push(`/agents/${agent.id}`);
      }
    } catch (error: any) {
      alert(`Failed to create agent: ${error.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <Link href="/agents" className="text-[#F54E00] hover:underline font-semibold text-sm mb-6 block">
          ← Back to agents
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <AgentsIllustrationIcon className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold text-[#111111]">Create Agent</h1>
            <p className="text-gray-600 text-sm">Define an autonomous agent with a goal, tools, and a model</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1 — Name & Goal */}
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <h3 className="text-base font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#F54E00] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Identity & Goal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Agent Name *</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Crypto Scout, Tech Researcher, Data Analyst"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Goal Template</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {GOAL_TEMPLATES.map((t, i) => (
                    <button key={t.label} type="button" onClick={() => applyTemplate(i)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                        goalTemplate === i ? 'bg-[#F54E00] text-white border-[#F54E00]' : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea required value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  onFocus={() => setGoalTemplate(GOAL_TEMPLATES.length - 1)}
                  rows={4}
                  placeholder="Describe exactly what this agent should do — be specific about the task, expected output, and any constraints."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00] resize-none" />
                <p className="text-xs text-gray-400 mt-1">The more specific the goal, the better the agent performs.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Description (optional)</label>
                <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short summary for the agents list"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
              </div>
            </div>
          </div>

          {/* Step 2 — Tools */}
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <h3 className="text-base font-bold text-[#111111] mb-1 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#F54E00] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Tools
              <span className="text-xs text-gray-400 font-normal">({selectedTools.length} selected)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4 ml-8">Pick the tools this agent can call. The AI decides which to use based on the goal.</p>

            {loadingTools ? (
              <div className="text-center py-6"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#F54E00]" /></div>
            ) : tools.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No tools registered. <Link href="/tools" className="text-[#F54E00] font-bold hover:underline">Add tools →</Link></p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {tools.map(tool => {
                  const selected = selectedTools.includes(tool.name);
                  return (
                    <button key={tool.id} type="button" onClick={() => toggleTool(tool.name)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-[#F54E00] bg-orange-50' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                      <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                        selected ? 'bg-[#F54E00] border-[#F54E00]' : 'border-gray-400'
                      }`}>
                        {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-[#111111]">{tool.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getCategoryColor(tool.category)}`}>{tool.category}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tool.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3 — Model & Limits */}
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <h3 className="text-base font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#F54E00] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Model & Limits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Provider</label>
                <select value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#F54E00]">
                  {PROVIDERS.map(p => <option key={p} value={p}>{p === 'simulation' ? 'Simulation (no API key)' : p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Model</label>
                <select value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#F54E00]">
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Max Iterations</label>
                <input type="number" min="1" max="20" value={formData.maxLoopIterations}
                  onChange={e => setFormData({ ...formData, maxLoopIterations: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Max Cost ($)</label>
                <input type="number" min="0" step="0.01" value={formData.maxCostPerExecution}
                  onChange={e => setFormData({ ...formData, maxCostPerExecution: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <label className="flex items-center gap-3 mb-5 cursor-pointer">
              <div
                onClick={() => setRunAfterCreate(!runAfterCreate)}
                className={`w-10 h-6 rounded-full transition-colors relative ${runAfterCreate ? 'bg-[#F54E00]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${runAfterCreate ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111]">Run immediately after creation</p>
                <p className="text-xs text-gray-500">Agent starts executing right away — you'll see live logs in Live Runs</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button type="submit" disabled={creating || selectedTools.length === 0}
                className="flex-1 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {creating ? 'Creating…' : runAfterCreate ? '🚀 Create & Run Agent' : 'Create Agent'}
              </button>
              <Link href="/agents"
                className="px-6 py-3 bg-white border-2 border-black text-[#111111] font-bold rounded-xl hover:bg-gray-50 transition-all text-sm text-center">
                Cancel
              </Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
