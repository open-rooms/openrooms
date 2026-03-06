'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#E8DCC8]">
      <Header title="Docs" subtitle="OpenRooms platform documentation" />
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>OpenRooms is a control plane for orchestrating workflows, agents, and autonomous runtime execution.</p>
              <p>
                Start with <Link href="/workflows" className="text-[#F54E00] font-semibold hover:underline">Workflows</Link>, then create a{' '}
                <Link href="/rooms?action=create" className="text-[#F54E00] font-semibold hover:underline">Room</Link> and run it.
              </p>
              <p>
                Manage agents in <Link href="/agents" className="text-[#F54E00] font-semibold hover:underline">Agents</Link> and observe live logs in{' '}
                <Link href="/live-runs" className="text-[#F54E00] font-semibold hover:underline">Live Runs</Link>.
              </p>
            </CardContent>
          </Card>

          <Card id="automation" className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle>Automation Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>Automation in OpenRooms defines policy-driven trigger patterns that dispatch workflows into rooms.</p>
              <p>Current UI supports pattern design; scheduler/webhook persistence is the next backend milestone.</p>
              <p>
                Continue from <Link href="/automation" className="text-[#F54E00] font-semibold hover:underline">Automation</Link> to design trigger intent,
                then wire execution through <Link href="/rooms" className="text-[#F54E00] font-semibold hover:underline">Rooms</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

