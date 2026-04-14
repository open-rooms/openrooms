'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlayIcon, PlusIcon, ClockIcon, ScheduledTaskIcon, EventTriggerIcon, WebhookIcon, QueueConsumerIcon } from '@/components/icons'
import { AutomationIcon as AutomationProductIcon } from '@/components/icons/product/AutomationIcon'

interface Trigger {
  id: string
  name: string
  type: 'schedule' | 'event' | 'webhook'
  status: 'active' | 'paused'
  targetWorkflow: string
  lastRun?: string
  nextRun?: string
  runCount: number
}

export default function AutomationPage() {
  // Automation triggers are not yet persisted by the backend.
  // The API does not expose a /api/automation endpoint yet.
  // This UI shows the intended trigger model and is ready to connect.
  const [triggers] = useState<Trigger[]>([])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule':
        return ScheduledTaskIcon
      case 'event':
        return EventTriggerIcon
      case 'webhook':
        return WebhookIcon
      default:
        return QueueConsumerIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'event':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'webhook':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const templates = [
    {
      name: 'Scheduled Task',
      description: 'Run workflows on a fixed schedule (cron)',
      icon: ScheduledTaskIcon,
      color: 'bg-blue-50 border-2 border-blue-200',
      hover: 'hover:border-[#93C5FD] hover:shadow-lg hover:-translate-y-1',
    },
    {
      name: 'Event Trigger',
      description: 'Execute on system events or data changes',
      icon: EventTriggerIcon,
      color: 'bg-orange-50 border-2 border-orange-200',
      hover: 'hover:border-[#FDBA74] hover:shadow-lg hover:-translate-y-1',
    },
    {
      name: 'Webhook Endpoint',
      description: 'HTTP endpoint for external integrations',
      icon: WebhookIcon,
      color: 'bg-emerald-50 border-2 border-emerald-200',
      hover: 'hover:border-[#5EEAD4] hover:shadow-lg hover:-translate-y-1',
    },
    {
      name: 'Queue Consumer',
      description: 'Process messages from job queue',
      icon: QueueConsumerIcon,
      color: 'bg-purple-50 border-2 border-purple-200',
      hover: 'hover:border-[#C084FC] hover:shadow-lg hover:-translate-y-1',
    }
  ]

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      <Header 
        title="Automation" 
        subtitle={`${triggers.length} active triggers`}
        actions={
          <Link href="/docs#automation" className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold rounded-lg transition-all duration-200">
            <PlusIcon className="w-4 h-4" />
            Automation Spec
          </Link>
        }
      />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Coming soon banner */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-amber-800 font-bold text-sm">Automation engine coming soon. </span>
              <span className="text-amber-700 text-sm">
                Trigger UX is live and aligned to the control-plane model. Persistence + scheduler/webhook runtime are the next backend milestone.
              </span>
            </div>
          </div>

          {/* Page hero icon */}
          <div className="flex items-center gap-6">
            <AutomationProductIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Automation</h1>
              <p className="text-gray-600 text-sm mt-1">Event-driven triggers and scheduled orchestration loops that fire workflows automatically.</p>
            </div>
          </div>

          {/* Trigger Templates */}
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Trigger Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {templates.map((template, idx) => {
                const IconComponent = template.icon
                return (
                  <Card key={idx} className={`${template.color} ${template.hover} transition-all duration-200 cursor-pointer group`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <IconComponent className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/docs#automation" className="block w-full text-center text-xs px-3 py-2 bg-[#EA580C] text-white rounded font-bold hover:bg-[#C2410C] transition-colors">
                        Configure Pattern
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Active Triggers */}
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Active Triggers</h2>
            <Card className="border border-[#D4C4A8] bg-white">
              <CardContent className="py-12 text-center">
                <AutomationProductIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <h3 className="font-semibold text-[#111111] mb-2">No active automation policies</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Define trigger patterns above, then wire them to room/workflow execution once the automation API is enabled.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
