'use client';

import { useState, useEffect } from 'react';
import { SettingsIcon, CheckCircleIcon, AlertCircleIcon, ZapIcon, ClockIcon, DatabaseIcon } from '@/components/icons';

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: number;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    scopes: 'read,write',
    rateLimit: '100',
    rateLimitWindow: '60',
    expiresIn: '365',
  });

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/api-keys');
      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload = {
        name: formData.name,
        scopes: formData.scopes.split(',').map(s => s.trim()),
        rateLimit: parseInt(formData.rateLimit),
        rateLimitWindow: parseInt(formData.rateLimitWindow),
        expiresIn: parseInt(formData.expiresIn),
      };

      const response = await fetch('http://localhost:3001/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyData(data.key);
        setShowCreateForm(false);
        setFormData({
          name: '',
          scopes: 'read,write',
          rateLimit: '100',
          rateLimitWindow: '60',
          expiresIn: '365',
        });
        fetchAPIKeys();
      } else {
        const error = await response.json();
        alert(`Failed to create API key: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAPIKeys();
      } else {
        alert('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-10 h-10" />
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">API Keys</h1>
          </div>
          <p className="text-gray-700 max-w-3xl flex items-center gap-2">
            <DatabaseIcon className="w-4 h-4" />
            Programmatic access with rate limiting and scopes
          </p>
        </div>

        {/* New Key Alert */}
        {newKeyData && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6 animate-bounce-in">
            <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Save Your API Key</h3>
            <p className="text-yellow-800 mb-4">
              This is the only time you'll see this key. Store it securely.
            </p>
            <div className="flex items-center gap-2 bg-white border-2 border-yellow-400 rounded-lg p-4">
              <code className="flex-1 font-mono text-sm break-all">{newKeyData}</code>
              <button
                onClick={() => copyToClipboard(newKeyData)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded transition-all"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setNewKeyData(null)}
              className="mt-4 text-yellow-800 hover:text-yellow-900 font-semibold"
            >
              I've saved it, dismiss this
            </button>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm ? (
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-6 animate-slide-up">
            <h3 className="text-xl font-bold text-[#111111] mb-4">Create New API Key</h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Key Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="e.g., Production API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Scopes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.scopes}
                    onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                    placeholder="read, write, admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rate Limit (requests)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Window (seconds)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rateLimitWindow}
                    onChange={(e) => setFormData({ ...formData, rateLimitWindow: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Expires In (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expiresIn}
                    onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F54E00]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Generate API Key'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-white border-2 border-black text-[#111111] font-bold rounded-lg hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              + Generate New API Key
            </button>
          </div>
        )}

        {/* API Keys List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54E00]"></div>
              <p className="mt-4 text-gray-600">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
              <SettingsIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-[#111111] mb-2">No API keys yet</h3>
              <p className="text-gray-600 mb-6">Generate your first API key for programmatic access.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-block px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white font-bold rounded-lg transition-all hover:scale-105"
              >
                + Generate First API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#111111]">{key.name}</h3>
                      {key.isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 border-2 border-green-200 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertCircleIcon className="w-3 h-3" />
                          REVOKED
                        </span>
                      )}
                      </div>
                      <p className="text-sm text-gray-600 font-mono mb-3">
                        Key Prefix: <span className="text-[#111111]">{key.keyPrefix}...</span>
                      </p>
                    </div>

                    {key.isActive && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                      >
                        Revoke
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <SettingsIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-600">Scopes</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded text-xs font-mono"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <ZapIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-600">Rate Limit</span>
                      </div>
                      <p className="font-mono text-[#111111]">
                        {key.rateLimit} / {key.rateLimitWindow}s
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-600">Created</span>
                      </div>
                      <p className="text-[#111111]">{new Date(key.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-600">Last Used</span>
                      </div>
                      <p className="text-[#111111]">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {key.expiresAt && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200 text-sm">
                      <span className="font-semibold text-gray-600">Expires:</span>{' '}
                      <span className="text-[#111111]">{new Date(key.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
