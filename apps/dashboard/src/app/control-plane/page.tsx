'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircleIcon, AlertCircleIcon, DatabaseFilledIcon, RedisCacheIcon, WorkersIcon, AgentRuntimeIcon, ResourceLimitsIcon, ControlPlaneIllustrationIcon, SettingsIllustrationIcon, APIIllustrationIcon } from '@/components/icons'
import { getHealth } from '@/lib/api'

export default function ControlPlanePage() {
  const [systemHealth, setSystemHealth] = useState<{
    database: string; redis: string; api: string; timestamp?: string; overall?: string
  }>({
    database: '…',
    redis: '…',
    api: '…',
  })
  const [healthError, setHealthError] = useState<string | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)

  useEffect(() => {
    async function fetchHealth() {
      try {
        const data = await getHealth()
        setSystemHealth({
          database: data.database || 'unknown',
          redis: data.redis || 'unknown',
          api: data.status || 'unknown',
          timestamp: data.timestamp,
          overall: data.status,
        })
        setHealthError(null)
      } catch {
        setHealthError('Backend unreachable — is the API running on port 3001?')
        setSystemHealth({ database: 'offline', redis: 'offline', api: 'offline' })
      } finally {
        setHealthLoading(false)
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    { name: 'PostgreSQL Database', status: 'Connected', version: '16.0', IconComponent: DatabaseFilledIcon, color: 'text-emerald-600' },
    { name: 'Redis Cache', status: 'Online', version: '7.2', IconComponent: RedisCacheIcon, color: 'text-blue-600' },
    { name: 'BullMQ Workers', status: 'Active', version: '5.1.0', IconComponent: WorkersIcon, color: 'text-purple-600' },
    { name: 'Agent Runtime', status: 'Running', version: '0.3.0', IconComponent: AgentRuntimeIcon, color: 'text-orange-600' },
  ]

  const configuration = [
    { category: 'API', key: 'PORT', value: '3001', sensitive: false },
    { category: 'API', key: 'LOG_LEVEL', value: 'info', sensitive: false },
    { category: 'LLM', key: 'OPENAI_API_KEY', value: 'sk-***', sensitive: true },
    { category: 'LLM', key: 'ANTHROPIC_API_KEY', value: 'sk-ant-***', sensitive: true },
    { category: 'Database', key: 'DATABASE_URL', value: 'postgresql://***', sensitive: true },
    { category: 'Redis', key: 'REDIS_URL', value: 'redis://localhost:6379', sensitive: false },
  ]

  const limits = [
    { name: 'Max Agent Loop Iterations', value: '10', category: 'Agent Policy' },
    { name: 'Max Tokens Per Request', value: '4000', category: 'Agent Policy' },
    { name: 'Max Cost Per Execution', value: '$1.00', category: 'Agent Policy' },
    { name: 'Rate Limit (API Keys)', value: '100/min', category: 'Authentication' },
    { name: 'Worker Concurrency', value: '5', category: 'Runtime' },
  ]

  const healthEntries = [
    { key: 'api', label: 'API Server' },
    { key: 'database', label: 'PostgreSQL' },
    { key: 'redis', label: 'Redis Cache' },
  ]

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'ok') return 'text-emerald-600'
    if (status === '…') return 'text-gray-400'
    return 'text-red-500'
  }

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header
        title="Control Plane"
        subtitle="System configuration and governance"
        actions={
          systemHealth.timestamp ? (
            <span className="text-xs text-gray-500">Last checked: {new Date(systemHealth.timestamp).toLocaleTimeString()}</span>
          ) : undefined
        }
      />

      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {healthError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{healthError}</span>
            </div>
          )}

          {/* System Health */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ControlPlaneIllustrationIcon className="w-8 h-8" />
                System Health
              </CardTitle>
              <CardDescription>
                {healthLoading ? 'Checking services…' : healthError ? 'API unreachable' : 'Live status from /api/health'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {healthEntries.map(({ key, label }) => {
                  const status = (systemHealth as Record<string, string>)[key] || '…'
                  const isHealthy = status === 'healthy' || status === 'ok'
                  return (
                    <div key={key} className="p-4 bg-white rounded-lg border border-[#D4C4A8] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className={`text-xs font-bold mt-1 capitalize ${getStatusColor(status)}`}>{status}</p>
                      </div>
                      {isHealthy ? (
                        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                      ) : status === '…' ? (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <AlertCircleIcon className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Connected Services */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WorkersIcon className="w-8 h-8" />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service, idx) => {
                  const ServiceIcon = service.IconComponent
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#D4C4A8] hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ServiceIcon className="w-10 h-10" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-text-secondary mt-1">
                            <span>Version: {service.version}</span>
                            <span className={`font-semibold ${service.color}`}>{service.status}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded font-semibold transition-colors">
                        Details
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIllustrationIcon className="w-8 h-8" />
                Configuration
              </CardTitle>
              <CardDescription>Environment variables and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {configuration.map((config, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-[#D4C4A8]">
                    <div className="flex items-center gap-4">
                      <APIIllustrationIcon className="w-4 h-4" />
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                        {config.category}
                      </span>
                      <span className="text-sm font-mono font-semibold">{config.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${config.sensitive ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {config.value}
                      </span>
                      {config.sensitive && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
                          Sensitive
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resource Limits */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ResourceLimitsIcon className="w-8 h-8" />
                Resource Limits & Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {limits.map((limit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-[#D4C4A8]">
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">
                        {limit.category}
                      </span>
                      <span className="text-sm font-semibold">{limit.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-[#F54E00]">{limit.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#D4C4A8]">
                <button className="w-full px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded transition-colors">
                  Edit Policies
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
