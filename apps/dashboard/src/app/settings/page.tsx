'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatabaseIcon, CpuIcon, MemoryIcon } from '@/components/icons'

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Configure your OpenRooms instance" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Page Theme Info */}
          <Card className="border border-[#DED8D2] bg-white hover:bg-[#FAFAF9] transition-colors duration-150 ease-in-out rounded-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <CardTitle>Page-Level Theming</CardTitle>
                  <CardDescription>Accent colors change automatically per page</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border hover:bg-surface-active transition-colors duration-150 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Dashboard</div>
                      <div className="text-xs text-text-secondary">Orange - Overview & metrics</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border hover:bg-surface-active transition-colors duration-150 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Workflows</div>
                      <div className="text-xs text-text-secondary">Blue - Process & orchestration</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border hover:bg-surface-active transition-colors duration-150 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Rooms</div>
                      <div className="text-xs text-text-secondary">Purple - Execution environments</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border hover:bg-surface-active transition-colors duration-150 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Tools</div>
                      <div className="text-xs text-text-secondary">Green - Plugins & extensions</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border hover:bg-surface-active transition-colors duration-150 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">Logs</div>
                      <div className="text-xs text-text-secondary">Gray - System logs & debugging</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-surface-active border border-border">
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Note:</span> The OpenRooms brand color (orange/amber) remains constant for logo and primary buttons. Page themes only affect secondary UI elements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Configuration Section */}
          <div className="pt-8 border-t border-[#DED8D2]">
            <h2 className="text-xl font-bold text-text-primary mb-6">System Configuration</h2>
            
            <div className="space-y-8">
              <Card className="border border-[#DED8D2] bg-white hover:bg-[#FAFAF9] transition-colors duration-150 ease-in-out rounded-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <CpuIcon className="w-12 h-12" />
                    <div>
                      <CardTitle>System Information</CardTitle>
                      <CardDescription>OpenRooms control plane details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Version</span>
                <span className="text-sm font-semibold text-text-primary">0.1.0</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">API Endpoint</span>
                <span className="text-sm font-mono text-brand font-semibold">http://localhost:3001</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Dashboard Port</span>
                <span className="text-sm font-mono text-text-primary font-semibold">3000</span>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-surface-active px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Architecture</span>
                <span className="text-sm text-text-primary font-semibold">Kysely + PostgreSQL + Redis</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#DED8D2] bg-white hover:bg-[#FAFAF9] transition-colors duration-150 ease-in-out rounded-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <DatabaseIcon className="w-12 h-12 text-gray-600" />
                <div>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>PostgreSQL connection information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Host</span>
                <span className="text-sm font-mono text-text-primary font-semibold">127.0.0.1:5432</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Database</span>
                <span className="text-sm font-mono text-text-primary font-semibold">openrooms</span>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-surface-active px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-semibold">CONNECTED</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#DED8D2] bg-white hover:bg-[#FAFAF9] transition-colors duration-150 ease-in-out rounded-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <MemoryIcon className="w-12 h-12" />
                <div>
                  <CardTitle>Redis</CardTitle>
                  <CardDescription>State management and caching</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-[#DED8D2] hover:bg-[#FAFAF9] px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Host</span>
                <span className="text-sm font-mono text-text-primary font-semibold">127.0.0.1:6379</span>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-surface-active px-4 transition-colors duration-150 ease-in-out">
                <span className="text-sm text-text-secondary font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-semibold">CONNECTED</span>
                </div>
              </div>
            </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
