'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatabaseIcon, CpuIcon, MemoryIcon, ChevronRightIcon } from '@/components/icons'

export default function ControlPlanePage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  return (
    <div>
      <Header title="Control Plane" subtitle="System configuration and health monitoring" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* System Health */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-600">Database</div>
                      <div className="text-sm font-semibold text-[#111111]">Connected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-600">Processing Engine</div>
                      <div className="text-sm font-semibold text-[#111111]">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-600">Connected Services</div>
                      <div className="text-sm font-semibold text-[#111111]">Online</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-600">Queue Status</div>
                      <div className="text-sm font-semibold text-[#111111]">Operational</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Version Information */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Version Information</h2>
            <Card className="border border-[#DED8D2] bg-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Release</div>
                    <div className="text-lg font-bold text-[#111111]">v0.2.5</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Validation</div>
                    <div className="text-lg font-bold text-green-600">Passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Technical Details (Collapsible) */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Technical Details</h2>
            
            <div className="space-y-3">
              {/* Database Details */}
              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <button
                    onClick={() => toggleSection('database')}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <DatabaseIcon className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-[#111111]">Database Configuration</span>
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.has('database') ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedSections.has('database') && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-[#DED8D2] font-mono text-xs space-y-2 text-gray-700">
                      <div><span className="text-gray-500">Host:</span> 127.0.0.1:5432</div>
                      <div><span className="text-gray-500">Database:</span> openrooms</div>
                      <div><span className="text-gray-500">Pool Size:</span> 10</div>
                      <div><span className="text-gray-500">Connection Timeout:</span> 5000ms</div>
                      <div><span className="text-gray-500">Schema Version:</span> 2.5.0</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Redis Details */}
              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <button
                    onClick={() => toggleSection('redis')}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <MemoryIcon className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-[#111111]">State Manager Configuration</span>
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.has('redis') ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedSections.has('redis') && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-[#DED8D2] font-mono text-xs space-y-2 text-gray-700">
                      <div><span className="text-gray-500">Host:</span> 127.0.0.1:6379</div>
                      <div><span className="text-gray-500">Max Retries:</span> 3</div>
                      <div><span className="text-gray-500">Retry Strategy:</span> Exponential backoff</div>
                      <div><span className="text-gray-500">Key Prefix:</span> rooms:</div>
                      <div><span className="text-gray-500">TTL:</span> Persistent</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Processing Engine Details */}
              <Card className="border border-[#DED8D2] bg-white">
                <CardContent className="p-4">
                  <button
                    onClick={() => toggleSection('engine')}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CpuIcon className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-[#111111]">Processing Engine</span>
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.has('engine') ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedSections.has('engine') && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-[#DED8D2] font-mono text-xs space-y-2 text-gray-700">
                      <div><span className="text-gray-500">Workers:</span> 2</div>
                      <div><span className="text-gray-500">Concurrency:</span> 5</div>
                      <div><span className="text-gray-500">Queue Provider:</span> BullMQ</div>
                      <div><span className="text-gray-500">Retry Policy:</span> 3 attempts with backoff</div>
                      <div><span className="text-gray-500">Idempotency:</span> Enabled</div>
                      <div><span className="text-gray-500">FSM Validation:</span> Strict mode</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
