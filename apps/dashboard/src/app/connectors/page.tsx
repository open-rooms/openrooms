'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircleIcon, CheckCircleIcon } from '@/components/icons'
import { APIIcon, AutomationIcon, ObservabilityIcon, IntegrationsIcon } from '@/components/icons/system'

// Use relative path so Next.js rewrites proxy to the backend
const API_BASE = ''

type ConnectorType = 'REST_API' | 'BLOCKCHAIN' | 'WEBHOOK'

interface Connector {
  id: string
  name: string
  type: ConnectorType
  description: string
  config: Record<string, unknown>
  createdAt: string
}

const CHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum Mainnet', rpc: 'https://eth.llamarpc.com' },
  { value: 'polygon', label: 'Polygon', rpc: 'https://polygon-rpc.com' },
  { value: 'arbitrum', label: 'Arbitrum One', rpc: 'https://arb1.arbitrum.io/rpc' },
  { value: 'base', label: 'Base', rpc: 'https://mainnet.base.org' },
  { value: 'optimism', label: 'Optimism', rpc: 'https://mainnet.optimism.io' },
  { value: 'custom', label: 'Custom RPC', rpc: '' },
]

const AUTH_TYPES = ['None', 'Bearer Token', 'API Key (Header)', 'Basic Auth']

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<ConnectorType | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // REST API form
  const [restForm, setRestForm] = useState({
    name: '',
    description: '',
    baseUrl: '',
    authType: 'None',
    authValue: '',
    authHeaderName: 'X-API-Key',
    endpoints: [{ method: 'GET', path: '/', description: 'Root endpoint' }],
  })

  // Blockchain form
  const [chainForm, setChainForm] = useState({
    name: '',
    description: '',
    chain: 'ethereum',
    customRpc: '',
    contractAddress: '',
    abiMethod: '',
    methodType: 'read',
  })

  async function loadConnectors() {
    try {
      const res = await fetch(`${API_BASE}/api/tools`)
      if (!res.ok) throw new Error('API unreachable')
      const data = await res.json()
      // Filter tools that are connectors (category = API or BLOCKCHAIN)
      const all: Connector[] = (data.tools || [])
        .filter((t: any) => ['API', 'BLOCKCHAIN', 'Webhook', 'REST_API'].includes(t.category))
        .map((t: any) => ({
          id: t.id,
          name: t.name,
          type: t.category === 'BLOCKCHAIN' ? 'BLOCKCHAIN' : 'REST_API',
          description: t.description,
          config: t.parameters || {},
          createdAt: t.createdAt,
        }))
      setConnectors(all)
    } catch {
      // API not up — show empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadConnectors() }, [])

  async function saveRestConnector() {
    if (!restForm.name || !restForm.baseUrl) { setError('Name and Base URL are required'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restForm.name,
          description: restForm.description || `REST API connector for ${restForm.baseUrl}`,
          category: 'API',
          url: restForm.baseUrl,
          method: restForm.endpoints[0]?.method || 'GET',
          parameters: [{
            name: 'endpoint',
            type: 'string',
            description: 'API endpoint path',
            required: true,
          }, {
            name: 'body',
            type: 'object',
            description: 'Request body (for POST/PUT)',
            required: false,
          }],
          config: {
            baseUrl: restForm.baseUrl,
            authType: restForm.authType,
            authValue: restForm.authType !== 'None' ? restForm.authValue : undefined,
            authHeaderName: restForm.authType === 'API Key (Header)' ? restForm.authHeaderName : undefined,
            endpoints: restForm.endpoints,
          },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to save')
      setSuccess(`REST connector "${restForm.name}" registered. Agents can now call it as a tool.`)
      setActiveForm(null)
      setRestForm({ name: '', description: '', baseUrl: '', authType: 'None', authValue: '', authHeaderName: 'X-API-Key', endpoints: [{ method: 'GET', path: '/', description: 'Root endpoint' }] })
      loadConnectors()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function saveBlockchainConnector() {
    if (!chainForm.name || !chainForm.contractAddress) { setError('Name and contract address are required'); return }
    setSaving(true); setError(null)
    try {
      const chain = CHAIN_OPTIONS.find(c => c.value === chainForm.chain)
      const rpcUrl = chainForm.chain === 'custom' ? chainForm.customRpc : chain?.rpc
      const res = await fetch(`${API_BASE}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: chainForm.name,
          description: chainForm.description || `Blockchain connector on ${chain?.label} — ${chainForm.contractAddress.slice(0, 10)}…`,
          category: 'BLOCKCHAIN',
          url: rpcUrl,
          method: 'POST',
          parameters: [{
            name: 'method',
            type: 'string',
            description: 'ABI method to call',
            required: true,
          }, {
            name: 'args',
            type: 'object',
            description: 'Method arguments',
            required: false,
          }],
          config: {
            chain: chainForm.chain,
            rpcUrl,
            contractAddress: chainForm.contractAddress,
            abiMethod: chainForm.abiMethod,
            methodType: chainForm.methodType,
          },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to save')
      setSuccess(`Blockchain connector "${chainForm.name}" registered on ${chain?.label}.`)
      setActiveForm(null)
      setChainForm({ name: '', description: '', chain: 'ethereum', customRpc: '', contractAddress: '', abiMethod: '', methodType: 'read' })
      loadConnectors()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function deleteConnector(id: string) {
    if (!confirm('Remove this connector?')) return
    try {
      await fetch(`${API_BASE}/api/tools/${id}`, { method: 'DELETE' })
      loadConnectors()
    } catch (e: any) { alert(e.message) }
  }

  const addEndpoint = () => setRestForm(f => ({ ...f, endpoints: [...f.endpoints, { method: 'GET', path: '/', description: '' }] }))
  const updateEndpoint = (i: number, field: string, value: string) => {
    setRestForm(f => ({ ...f, endpoints: f.endpoints.map((ep, idx) => idx === i ? { ...ep, [field]: value } : ep) }))
  }

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      <div className="border-b border-[#E8E0D0] bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <APIIcon className="w-10 h-10 flex-shrink-0 transition-transform hover:scale-105 duration-200" />
          <div>
            <h1 className="text-xl font-extrabold text-[#111]">Connectors</h1>
            <p className="text-gray-400 text-xs mt-0.5">Register REST APIs, blockchain contracts and webhooks as callable agent tools</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveForm('REST_API'); setError(null); setSuccess(null) }}
            className="px-4 py-2 text-white text-sm font-bold rounded-xl transition-all"
            style={{ backgroundColor: '#EA580C' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2410C'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA580C'}>
            + REST API
          </button>
          <button onClick={() => { setActiveForm('BLOCKCHAIN'); setError(null); setSuccess(null) }}
            className="px-4 py-2 bg-[#111] hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors">
            + Blockchain
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-emerald-700">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
            </div>
          )}

          {/* What connectors are */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                Icon: APIIcon,
                iconBg: '#93C5FD',
                title: 'REST API',
                desc: 'Register any HTTP endpoint with auth. Agents call it by name — they handle the parameters.',
                examples: ['Stripe · send invoice', 'CoinGecko · get price', 'Your backend · query data'],
                color: 'border-[#93C5FD]',
                bg: 'bg-white',
              },
              {
                Icon: IntegrationsIcon,
                iconBg: '#C4B5FD',
                title: 'Blockchain',
                desc: 'Read state or query events from any EVM contract. Agents reason over on-chain data.',
                examples: ['ERC-20 balanceOf', 'Uniswap getReserves', 'Custom contract state'],
                color: 'border-[#C4B5FD]',
                bg: 'bg-white',
              },
              {
                Icon: AutomationIcon,
                iconBg: '#FCA5A5',
                title: 'Webhook Triggers',
                desc: 'Every room has an inbound webhook URL. Post from any external system to start execution.',
                examples: ['Smart contract event', 'Stripe payment hook', 'GitHub push event'],
                color: 'border-[#FCA5A5]',
                bg: 'bg-white',
              },
            ].map(c => (
              <div key={c.title} className={`border-2 rounded-2xl p-5 ${c.color} ${c.bg} hover:shadow-md transition-all duration-200 group`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: c.iconBg + '30', border: `1.5px solid ${c.iconBg}` }}>
                  <c.Icon className="w-9 h-9" />
                </div>
                <h3 className="font-extrabold text-[#111111] mb-1.5">{c.title}</h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{c.desc}</p>
                <ul className="space-y-1.5">
                  {c.examples.map(ex => (
                    <li key={ex} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.iconBg }} />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── REST API Form ──────────────────────────────────────────────────── */}
          {activeForm === 'REST_API' && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                  <APIIcon className="w-6 h-6" /> Register REST API Connector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Connector Name *</label>
                    <input value={restForm.name} onChange={e => setRestForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. coingecko_prices" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
                    <p className="text-[10px] text-gray-400 mt-0.5">This is what agents call: <code>use coingecko_prices</code></p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Base URL *</label>
                    <input value={restForm.baseUrl} onChange={e => setRestForm(f => ({ ...f, baseUrl: e.target.value }))}
                      placeholder="https://api.coingecko.com/api/v3" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                  <input value={restForm.description} onChange={e => setRestForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What does this API do? Be specific — this is what the agent reads to decide when to call it." className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
                </div>

                {/* Auth */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Authentication</label>
                    <select value={restForm.authType} onChange={e => setRestForm(f => ({ ...f, authType: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#EA580C]">
                      {AUTH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  {restForm.authType !== 'None' && (
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">
                        {restForm.authType === 'Basic Auth' ? 'Username:Password' : 'Token / Key Value'}
                      </label>
                      <input
                        type="password"
                        value={restForm.authValue}
                        onChange={e => setRestForm(f => ({ ...f, authValue: e.target.value }))}
                        placeholder={restForm.authType === 'Bearer Token' ? 'sk-...' : restForm.authType === 'Basic Auth' ? 'user:password' : 'your-api-key'}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                  )}
                  {restForm.authType === 'API Key (Header)' && (
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Header Name</label>
                      <input value={restForm.authHeaderName} onChange={e => setRestForm(f => ({ ...f, authHeaderName: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
                    </div>
                  )}
                </div>

                {/* Endpoints */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-600">Endpoints to expose as tools</label>
                    <button type="button" onClick={addEndpoint} className="text-xs font-bold text-[#EA580C] hover:underline">+ Add endpoint</button>
                  </div>
                  <div className="space-y-2">
                    {restForm.endpoints.map((ep, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select value={ep.method} onChange={e => updateEndpoint(i, 'method', e.target.value)}
                          className="w-24 px-2 py-2 border-2 border-gray-200 rounded-lg text-xs bg-white font-bold">
                          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
                        </select>
                        <input value={ep.path} onChange={e => updateEndpoint(i, 'path', e.target.value)}
                          placeholder="/simple/price?ids=bitcoin&vs_currencies=usd"
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#EA580C]" />
                        <input value={ep.description} onChange={e => updateEndpoint(i, 'description', e.target.value)}
                          placeholder="Get BTC price in USD"
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#EA580C]" />
                        {restForm.endpoints.length > 1 && (
                          <button type="button" onClick={() => setRestForm(f => ({ ...f, endpoints: f.endpoints.filter((_, idx) => idx !== i) }))}
                            className="text-gray-400 hover:text-red-500 font-bold text-sm">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveRestConnector} disabled={saving}
                    className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
                    {saving ? 'Registering…' : 'Register Connector'}
                  </button>
                  <button onClick={() => setActiveForm(null)} className="px-4 py-2.5 border-2 border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Blockchain Form ────────────────────────────────────────────────── */}
          {activeForm === 'BLOCKCHAIN' && (
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                  <IntegrationsIcon className="w-6 h-6" /> Register Blockchain Connector
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Read on-chain state or query contract events. Agents call this by name to get live blockchain data.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Connector Name *</label>
                    <input value={chainForm.name} onChange={e => setChainForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. usdc_balance_checker" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
                    <p className="text-[10px] text-gray-400 mt-0.5">Agents call this by name to read chain state</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Network</label>
                    <select value={chainForm.chain} onChange={e => setChainForm(f => ({ ...f, chain: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-400">
                      {CHAIN_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {chainForm.chain === 'custom' && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Custom RPC URL</label>
                    <input value={chainForm.customRpc} onChange={e => setChainForm(f => ({ ...f, customRpc: e.target.value }))}
                      placeholder="https://your-node.example.com" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Contract Address *</label>
                  <input value={chainForm.contractAddress} onChange={e => setChainForm(f => ({ ...f, contractAddress: e.target.value }))}
                    placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-purple-400" />
                  <p className="text-[10px] text-gray-400 mt-0.5">Example: USDC on Ethereum</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Method to expose</label>
                    <input value={chainForm.abiMethod} onChange={e => setChainForm(f => ({ ...f, abiMethod: e.target.value }))}
                      placeholder="balanceOf(address)" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Call type</label>
                    <select value={chainForm.methodType} onChange={e => setChainForm(f => ({ ...f, methodType: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-400">
                      <option value="read">Read (view/pure — free, no gas)</option>
                      <option value="event">Event query (filter past logs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                  <input value={chainForm.description} onChange={e => setChainForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Returns the USDC balance for a given address on Ethereum mainnet"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
                </div>

                <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg text-xs text-purple-800">
                  <strong>Read-only by default.</strong> Agents query chain state without a private key — no transactions.
                  Write operations (sending txs) require a signer key configured server-side.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveBlockchainConnector} disabled={saving}
                    className="px-6 py-2.5 bg-[#111111] hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
                    {saving ? 'Registering…' : 'Register Connector'}
                  </button>
                  <button onClick={() => setActiveForm(null)} className="px-4 py-2.5 border-2 border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Connector List ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-base font-bold text-[#111111] mb-3">
              Registered Connectors
              <span className="ml-2 text-xs font-normal text-gray-400">({connectors.length})</span>
            </h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto" />
              </div>
            ) : connectors.length === 0 ? (
              <div className="border-2 border-dashed border-[#D4C4A8] rounded-2xl bg-white">
                  <div className="text-center py-12">
                  <APIIcon className="w-14 h-14 mx-auto mb-3 opacity-30" />
                  <h3 className="font-bold text-[#111111] mb-2">No connectors yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Register a REST API or blockchain contract above. Once registered, agents can call them by name in their reasoning loop.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {connectors.map(c => (
                  <div key={c.id} className="border border-[#D4C4A8] bg-white rounded-2xl hover:border-[#EA580C] hover:shadow-md transition-all duration-200 group">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            c.type === 'BLOCKCHAIN' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {c.type === 'BLOCKCHAIN'
                              ? <IntegrationsIcon className="w-7 h-7" />
                              : <APIIcon className="w-7 h-7" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="font-bold text-[#111111] font-mono text-sm">{c.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                c.type === 'BLOCKCHAIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                              }`}>{c.type === 'BLOCKCHAIN' ? 'BLOCKCHAIN' : 'REST API'}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{c.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteConnector(c.id)}
                            className="px-2 py-1 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 text-xs font-bold rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
