'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDownIcon, ChevronRightIcon } from '@/components/icons'

export default function AutomationPage() {
  const [expandedAdvanced, setExpandedAdvanced] = useState(false)

  const activeRuns = [
    { id: '1', name: 'Data Processing Pipeline', status: 'running', startedAt: '2 minutes ago' },
    { id: '2', name: 'Customer Onboarding Flow', status: 'running', startedAt: '15 minutes ago' },
  ]

  const history = [
    { id: '3', name: 'Weekly Report Generation', status: 'completed', completedAt: '1 hour ago', duration: '3m 24s' },
    { id: '4', name: 'Email Campaign Trigger', status: 'completed', completedAt: '2 hours ago', duration: '45s' },
    { id: '5', name: 'Inventory Sync', status: 'failed', completedAt: '3 hours ago', duration: '1m 12s' },
  ]

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header title="Automation Center" subtitle="Monitor runs and view execution history" />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Active Runs */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Active Runs</h2>
            <div className="space-y-3">
              {activeRuns.map((run) => (
                <Card key={run.id} className="border border-[#D4C4A8] bg-[#F5F1E8] hover:bg-white hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-medium text-[#111111]">{run.name}</div>
                        <div className="text-sm text-gray-600">Started {run.startedAt}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Running
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeRuns.length === 0 && (
                <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
                  <CardContent className="p-8 text-center text-gray-600">
                    No active runs
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* History */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">History</h2>
            <div className="space-y-3">
              {history.map((run) => (
                <Card key={run.id} className="border border-[#D4C4A8] bg-[#F5F1E8] hover:bg-white hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${run.status === 'completed' ? 'bg-gray-400' : 'bg-red-500'}`}></div>
                      <div>
                        <div className="font-medium text-[#111111]">{run.name}</div>
                        <div className="text-sm text-gray-600">
                          Completed {run.completedAt} · Duration: {run.duration}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      run.status === 'completed' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {run.status === 'completed' ? 'Completed' : 'Failed'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Reliability */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Reliability</h2>
            <Card className="border border-[#DED8D2] bg-white">
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-sm text-[#111111]">Protected against duplicate runs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-sm text-[#111111]">Safe state transitions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-sm text-[#111111]">Automatic recovery on interruption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-sm text-[#111111]">Repeatable results</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedAdvanced(!expandedAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-[#F54E00] hover:text-[#E24600] transition-colors"
                >
                  {expandedAdvanced ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                  How this works
                </button>

                {expandedAdvanced && (
                  <div className="mt-4 p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2]">
                    <p className="text-sm text-gray-700 mb-3">
                      OpenRooms ensures reliable execution through several mechanisms:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><strong>Deterministic execution:</strong> Each run follows a predictable path with consistent outcomes</li>
                      <li><strong>State validation:</strong> The system validates every state change to prevent invalid transitions</li>
                      <li><strong>Append-only logs:</strong> Complete audit trail preserves every event for debugging and compliance</li>
                      <li><strong>Automatic recovery:</strong> Interrupted runs resume safely without data loss or duplication</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Advanced (Collapsible) */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Advanced</h2>
            <Card className="border border-[#DED8D2] bg-white">
              <CardContent className="p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-medium text-[#111111]">Detailed trace information</span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2] font-mono text-xs">
                    <pre className="text-gray-700 whitespace-pre-wrap">
{`System Health: Operational
Database: Connected (3ms latency)
Processing Engine: Active (2 workers)
Queue Depth: 0 pending
Last Health Check: 2 seconds ago

Execution Guarantees:
- Idempotency: Enabled
- FSM Validation: Active
- Crash Recovery: Enabled
- Log Persistence: Append-only mode`}
                    </pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  )
}
