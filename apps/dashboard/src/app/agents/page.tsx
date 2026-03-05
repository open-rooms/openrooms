'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AgentsPage() {
  return (
    <div>
      <Header title="Agents" subtitle="Design, version and deploy autonomous AI units" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border border-[#DED8D2] bg-white">
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#F54E00]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="8" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="12" r="1" fill="currentColor"/>
                    <circle cx="15" cy="12" r="1" fill="currentColor"/>
                    <path d="M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">Agent Builder</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create and manage autonomous AI units with memory, tools and execution policies
                </p>
                <button className="px-6 py-2 bg-[#F54E00] text-white rounded-lg font-medium hover:bg-[#E24600] transition-colors">
                  Create Agent
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
