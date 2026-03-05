'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RuntimePage() {
  return (
    <div>
      <Header title="Runtime" subtitle="Execution engine powering rooms, workflows and agent communication" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Runtime Status */}
          <Card className="border border-[#DED8D2] bg-white">
            <CardHeader>
              <CardTitle>Runtime Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-[#111111]">Scheduler</span>
                  </div>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-[#111111]">Policy Engine</span>
                  </div>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="p-4 bg-[#FBF7F2] rounded-lg border border-[#DED8D2]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-[#111111]">State Manager</span>
                  </div>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Runtime Metrics */}
          <Card className="border border-[#DED8D2] bg-white">
            <CardHeader>
              <CardTitle>Execution Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#DED8D2]">
                  <span className="text-sm text-gray-600">Active Executions</span>
                  <span className="text-lg font-bold text-[#111111]">12</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#DED8D2]">
                  <span className="text-sm text-gray-600">Queued Tasks</span>
                  <span className="text-lg font-bold text-[#111111]">3</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-lg font-bold text-green-600">142ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
