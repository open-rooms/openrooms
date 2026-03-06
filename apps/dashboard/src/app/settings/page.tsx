'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SettingsIllustrationIcon, CheckCircleIcon, AlertCircleIcon, ZapIcon, ClockIcon } from '@/components/icons';
import { getProviderSettings, saveProviderSettings, getPlatformStatus, getAPIKeys, createAPIKey, deleteAPIKey } from '@/lib/api';

interface ProviderState {
  configured: boolean;
  keyPreview: string | null;
  keySource: string;
  model: string;
  availableModels: string[];
}

interface APIKey {
  id: string; name: string; keyPrefix: string; scopes: string[];
  rateLimit: number; rateLimitWindow: number; isActive: boolean;
  expiresAt?: string; lastUsedAt?: string; createdAt: string;
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<{ openai: ProviderState; anthropic: ProviderState } | null>(null);
  const [defaultProvider, setDefaultProvider] = useState('openai');
  const [status, setStatus] = useState({ agents: 0, workflows: 0, tools: 0, runs: 0 });
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);

  // LLM form state
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-3.5-turbo');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-haiku-20240307');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // API key form
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState<string | null>(null);
  const [keyForm, setKeyForm] = useState({ name: '', scopes: 'read,write', rateLimit: '100', rateLimitWindow: '60', expiresIn: '365' });
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    Promise.all([
      getProviderSettings().then(d => {
        setProviders(d.providers as any);
        setDefaultProvider(d.defaultProvider);
        setOpenaiModel(d.providers.openai.model);
        setAnthropicModel(d.providers.anthropic.model);
      }).catch(() => {}),
      getPlatformStatus().then(setStatus).catch(() => {}),
      getAPIKeys().then(d => setApiKeys(d.keys || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSaveProviders = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      await saveProviderSettings({
        openai: { apiKey: openaiKey || undefined, model: openaiModel },
        anthropic: { apiKey: anthropicKey || undefined, model: anthropicModel },
        defaultProvider,
      });
      setSaveMsg({ ok: true, text: 'Provider settings saved. New runs will use your updated keys.' });
      setOpenaiKey('');
      setAnthropicKey('');
      // Reload provider status
      const fresh = await getProviderSettings();
      setProviders(fresh.providers as any);
      setDefaultProvider(fresh.defaultProvider);
    } catch (e: any) {
      setSaveMsg({ ok: false, text: e.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingKey(true);
    try {
      const data = await createAPIKey({
        name: keyForm.name,
        scopes: keyForm.scopes.split(',').map(s => s.trim()),
        rateLimit: parseInt(keyForm.rateLimit),
        rateLimitWindow: parseInt(keyForm.rateLimitWindow),
        expiresIn: parseInt(keyForm.expiresIn),
      });
      setNewKeyData(data.key);
      setShowKeyForm(false);
      setKeyForm({ name: '', scopes: 'read,write', rateLimit: '100', rateLimitWindow: '60', expiresIn: '365' });
      const fresh = await getAPIKeys();
      setApiKeys(fresh.keys || []);
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await deleteAPIKey(id).catch(() => {});
    const fresh = await getAPIKeys();
    setApiKeys(fresh.keys || []);
  };

  const configured = providers?.openai.configured || providers?.anthropic.configured;

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIllustrationIcon className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold text-[#111111]">Settings</h1>
            <p className="text-gray-600 text-sm mt-0.5">Configure your LLM providers and platform access</p>
          </div>
        </div>

        {/* Setup banner — only shown when no LLM key is configured */}
        {!loading && !configured && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 flex gap-4 items-start">
            <div className="text-2xl">⚡</div>
            <div>
              <p className="font-bold text-amber-900 mb-1">Add your LLM key to unlock real AI reasoning</p>
              <p className="text-amber-800 text-sm">
                Without it, agents run in <strong>simulation mode</strong> — the full execution loop runs but with deterministic (non-AI) reasoning.
                Add an OpenAI or Anthropic key below to switch to real GPT/Claude intelligence.
              </p>
            </div>
          </div>
        )}

        {/* Platform snapshot */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Agents', value: status.agents, href: '/agents', color: 'text-purple-600' },
            { label: 'Workflows', value: status.workflows, href: '/workflows', color: 'text-indigo-600' },
            { label: 'Tools', value: status.tools, href: '/tools', color: 'text-orange-600' },
            { label: 'Total Runs', value: status.runs, href: '/live-runs', color: 'text-emerald-600' },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className="bg-white border-2 border-black rounded-xl p-4 hover:shadow-lg transition-all group">
              <div className={`text-2xl font-bold ${s.color} group-hover:scale-110 transition-transform`}>{loading ? '…' : s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* ── LLM Providers ── */}
        <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">LLM Providers</h2>
              <p className="text-sm text-gray-500 mt-0.5">Keys are stored encrypted and used by all agent and workflow runs</p>
            </div>
            {configured && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                <CheckCircleIcon className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProviders} className="p-6 space-y-6">
            {/* Default provider selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Default Provider</label>
              <div className="flex gap-3">
                {(['openai', 'anthropic', 'simulation'] as const).map(p => (
                  <button key={p} type="button"
                    onClick={() => setDefaultProvider(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                      defaultProvider === p
                        ? 'bg-[#F54E00] text-white border-[#F54E00]'
                        : 'bg-white text-[#111111] border-black hover:bg-gray-50'
                    }`}>
                    {p === 'openai' ? 'OpenAI' : p === 'anthropic' ? 'Anthropic' : 'Simulation'}
                  </button>
                ))}
              </div>
              {defaultProvider === 'simulation' && (
                <p className="text-xs text-gray-500 mt-1.5">Simulation mode runs the full agent loop with deterministic reasoning — useful for testing without API costs.</p>
              )}
            </div>

            {/* OpenAI */}
            <div className="rounded-xl border-2 border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">AI</span>
                  </div>
                  <span className="font-bold text-[#111111]">OpenAI</span>
                </div>
                {providers?.openai.configured ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    {providers.openai.keyPreview} · via {providers.openai.keySource}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <AlertCircleIcon className="w-3.5 h-3.5" /> Not configured
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    API Key {providers?.openai.configured && <span className="text-gray-400 font-normal">(leave blank to keep existing)</span>}
                  </label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                    placeholder={providers?.openai.configured ? '••••••••••••••••' : 'sk-proj-...'}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Model</label>
                  <select
                    value={openaiModel}
                    onChange={e => setOpenaiModel(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00] bg-white"
                  >
                    {['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Anthropic */}
            <div className="rounded-xl border-2 border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#CC785C] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">A</span>
                  </div>
                  <span className="font-bold text-[#111111]">Anthropic</span>
                </div>
                {providers?.anthropic.configured ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    {providers.anthropic.keyPreview} · via {providers.anthropic.keySource}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <AlertCircleIcon className="w-3.5 h-3.5" /> Not configured
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    API Key {providers?.anthropic.configured && <span className="text-gray-400 font-normal">(leave blank to keep existing)</span>}
                  </label>
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={e => setAnthropicKey(e.target.value)}
                    placeholder={providers?.anthropic.configured ? '••••••••••••••••' : 'sk-ant-...'}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Model</label>
                  <select
                    value={anthropicModel}
                    onChange={e => setAnthropicModel(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00] bg-white"
                  >
                    {['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${saveMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {saveMsg.ok ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
                {saveMsg.text}
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Provider Settings'}
            </button>
          </form>
        </div>

        {/* ── OpenRooms API Keys ── */}
        <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">API Keys</h2>
              <p className="text-sm text-gray-500 mt-0.5">Programmatic access to the OpenRooms control plane</p>
            </div>
            <button onClick={() => setShowKeyForm(true)}
              className="px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-lg transition-all">
              + New Key
            </button>
          </div>

          {/* New key reveal */}
          {newKeyData && (
            <div className="mx-6 mt-4 bg-amber-50 border-2 border-amber-400 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Copy this key now — it won't be shown again</p>
              <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-lg p-3">
                <code className="flex-1 font-mono text-xs break-all">{newKeyData}</code>
                <button onClick={() => { navigator.clipboard.writeText(newKeyData); }}
                  className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded">Copy</button>
              </div>
              <button onClick={() => setNewKeyData(null)} className="mt-2 text-xs text-amber-700 font-semibold hover:underline">
                I've saved it ✓
              </button>
            </div>
          )}

          {/* Create form */}
          {showKeyForm && (
            <form onSubmit={handleCreateAPIKey} className="mx-6 mt-4 border-2 border-gray-100 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Key Name *</label>
                  <input required value={keyForm.name} onChange={e => setKeyForm({...keyForm, name: e.target.value})}
                    placeholder="e.g. My App" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Scopes</label>
                  <input value={keyForm.scopes} onChange={e => setKeyForm({...keyForm, scopes: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F54E00]" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={creatingKey}
                  className="flex-1 py-2 bg-[#F54E00] text-white text-sm font-bold rounded-lg disabled:opacity-50">
                  {creatingKey ? 'Creating…' : 'Generate Key'}
                </button>
                <button type="button" onClick={() => setShowKeyForm(false)}
                  className="px-4 py-2 border-2 border-black text-sm font-bold rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="p-6">
            {apiKeys.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No API keys yet. Generate one to call OpenRooms from your own apps.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#111111]">{key.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${key.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {key.isActive ? 'ACTIVE' : 'REVOKED'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-mono">{key.keyPrefix}...</span>
                        <span className="flex items-center gap-1"><ZapIcon className="w-3 h-3" />{key.rateLimit}/{key.rateLimitWindow}s</span>
                        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'never used'}
                        </span>
                      </div>
                    </div>
                    {key.isActive && (
                      <button onClick={() => handleRevokeKey(key.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
