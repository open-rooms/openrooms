'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlayIcon, PlusIcon, ClockIcon, ScheduledTaskIcon, EventTriggerIcon, WebhookIcon, QueueConsumerIcon, AutomationIllustrationIcon } from '@/components/icons'

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
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      name: 'Daily Market Analysis',
      type: 'schedule',
      status: 'active',
      targetWorkflow: 'Market Research',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 82800000).toISOString(),
      runCount: 143
    },
    {
      id: '2',
      name: 'New Customer Onboarding',
      type: 'event',
      status: 'active',
      targetWorkflow: 'Customer Setup',
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      runCount: 87
    },
    {
      id: '3',
      name: 'External API Webhook',
      type: 'webhook',
      status: 'paused',
      targetWorkflow: 'Data Sync',
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      runCount: 234
    }
  ])

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
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    {
      name: 'Event Trigger',
      description: 'Execute on system events or data changes',
      icon: EventTriggerIcon,
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400'
    },
    {
      name: 'Webhook Endpoint',
      description: 'HTTP endpoint for external integrations',
      icon: WebhookIcon,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
    },
    {
      name: 'Queue Consumer',
      description: 'Process messages from job queue',
      icon: QueueConsumerIcon,
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400'
    }
  ]

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header 
        title="Automation" 
        subtitle={`${triggers.length} active triggers`}
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-lg transition-all duration-200">
            <PlusIcon className="w-4 h-4" />
            New Trigger
          </button>
        }
      />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Active Triggers</CardDescription>
                <CardTitle className="text-4xl font-bold text-emerald-600">
                  {triggers.filter(t => t.status === 'active').length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">Running automation rules</p>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Total Executions</CardDescription>
                <CardTitle className="text-4xl font-bold text-blue-600">
                  {triggers.reduce((sum, t) => sum + t.runCount, 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">Workflow runs triggered</p>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Trigger Types</CardDescription>
                <CardTitle className="text-4xl font-bold text-purple-600">
                  {new Set(triggers.map(t => t.type)).size}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">Different automation methods</p>
              </CardContent>
            </Card>
          </div>

          {/* Trigger Templates */}
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Trigger Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {templates.map((template, idx) => {
                const IconComponent = template.icon
                return (
                  <Card key={idx} className={`border-2 ${template.color} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 flex items-center justify-center">
                          <IconComponent className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <button className="w-full text-xs px-3 py-2 bg-[#F54E00] text-white rounded font-bold hover:bg-[#E24600] transition-colors">
                        Create Trigger
                      </button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Active Triggers */}
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Active Triggers</h2>
            <div className="grid grid-cols-1 gap-6">
              {triggers.map((trigger) => {
                const TriggerIcon = getTypeIcon(trigger.type)
                return (
                  <Card key={trigger.id} className="border border-[#D4C4A8] bg-[#F5F1E8] hover:bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border-2 border-[#D4C4A8]">
                            <TriggerIcon className="w-10 h-10" />
                          </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-text-primary">{trigger.name}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border-2 ${getTypeColor(trigger.type)}`}>
                              {trigger.type}
                            </span>
                            {trigger.status === 'active' ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 font-semibold">Paused</span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mb-3">Target: {trigger.targetWorkflow}</p>
                          <div className="flex items-center gap-6 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              Runs: {trigger.runCount}
                            </span>
                            {trigger.lastRun && (
                              <span>Last: {new Date(trigger.lastRun).toLocaleString()}</span>
                            )}
                            {trigger.nextRun && (
                              <span className="text-emerald-600 font-semibold">
                                Next: {new Date(trigger.nextRun).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded transition-colors">
                          {trigger.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button className="px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-xs font-bold rounded transition-colors flex items-center gap-2">
                          <PlayIcon className="w-4 h-4" />
                          Run Now
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
