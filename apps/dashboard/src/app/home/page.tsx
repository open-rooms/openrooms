'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardIcon } from '@/components/icons/DashboardIcon'
import { RoomsIcon } from '@/components/icons/RoomsIcon'
import { WorkflowIcon } from '@/components/icons/WorkflowIcon'
import { AutomationIcon } from '@/components/icons/AutomationIcon'
import { LiveRunsIcon } from '@/components/icons/LiveRunsIcon'
import { ToolIcon } from '@/components/icons/ToolIcon'
import { AgentIcon } from '@/components/icons/AgentIcon'
import { RuntimeIcon } from '@/components/icons/RuntimeIcon'
import { SettingsIcon } from '@/components/icons/SettingsIcon'
import { ChevronRightIcon } from '@/components/icons'
import { useEffect, useState } from 'react'

interface AppCard {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  href: string
  category: string
}

const apps: AppCard[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'System overview & real-time metrics', icon: DashboardIcon, href: '/dashboard', category: 'AGENT://DASHBOARD' },
  { id: 'rooms', name: 'Rooms', description: 'Agent execution environments', icon: RoomsIcon, href: '/rooms', category: 'AGENT://ROOMS' },
  { id: 'workflows', name: 'Workflows', description: 'Orchestration templates', icon: WorkflowIcon, href: '/workflows', category: 'AGENT://WORKFLOWS' },
  { id: 'automation', name: 'Automation', description: 'Event-driven triggers and scheduled loops', icon: AutomationIcon, href: '/automation', category: 'AGENT://AUTOMATION' },
  { id: 'live-runs', name: 'Live Runs', description: 'Real-time execution streams and system events', icon: LiveRunsIcon, href: '/live-runs', category: 'AGENT://LIVE-RUNS' },
  { id: 'tools', name: 'Tools', description: 'Plugin marketplace', icon: ToolIcon, href: '/tools', category: 'AGENT://TOOLS' },
  { id: 'agents', name: 'Agents', description: 'Design and deploy autonomous AI units', icon: AgentIcon, href: '/agents', category: 'AGENT://AGENTS' },
  { id: 'runtime', name: 'Runtime', description: 'Execution engine powering rooms and workflows', icon: RuntimeIcon, href: '/runtime', category: 'AGENT://RUNTIME' },
  { id: 'control-plane', name: 'Control Plane', description: 'System configuration', icon: SettingsIcon, href: '/control-plane', category: 'AGENT://SETTINGS' },
]

const BuildIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="28" width="56" height="40" rx="8" fill="#A78BFA" stroke="#000" strokeWidth="2.5"/>
    <rect x="32" y="40" width="32" height="16" rx="4" fill="#000"/>
    <circle cx="38" cy="48" r="3" fill="#A78BFA"/>
    <circle cx="58" cy="48" r="3" fill="#A78BFA"/>
  </svg>
)

const DeployRunIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="28" fill="#60A5FA" stroke="#000" strokeWidth="2.5"/>
    <path d="M40 35 L40 61 L65 48 Z" fill="#000"/>
  </svg>
)

const ObserveGovernIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="28" width="60" height="40" rx="8" fill="#FDA4AF" stroke="#000" strokeWidth="2.5"/>
    <path d="M28 48 L38 48 L44 38 L52 58 L58 48 L68 48" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="72" cy="48" r="4" fill="#000"/>
  </svg>
)

const categoryGroups = [
  { title: 'BUILD', icon: BuildIcon, items: ['Agents', 'Workflows', 'Tools'] },
  { title: 'DEPLOY & RUN', icon: DeployRunIcon, items: ['Rooms', 'Runtime', 'Automation'] },
  { title: 'OBSERVE & GOVERN', icon: ObserveGovernIcon, items: ['Live Runs', 'Dashboard', 'Control Plane'] },
]

const poweredByFeatures = [
  'Deterministic Runtime',
  'Event-Driven Automation',
  'Multi-Model AI Execution',
  'Secure Room Isolation',
  'API & Tool Connectors',
  'Blockchain Integrations',
]

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('')
  const [liveActivity, setLiveActivity] = useState([
    { time: '12:03:12', message: 'Agent "ResearchAgent" executed workflow /market-analysis' },
    { time: '12:02:58', message: 'Room "Sandbox-3" initialized' },
    { time: '12:02:41', message: 'Tool call: OpenAI gpt-4.1 invoked' },
    { time: '12:02:15', message: 'Automation trigger fired: market_update' },
    { time: '12:01:59', message: 'Execution completed successfully' },
  ])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#E8DCC8] pb-24 animate-fade-in">
      {/* Top Navigation Bar */}
      <nav className="bg-[#F5F1E8] border-b-2 border-black sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <AgentIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold text-[#111111]">OpenRooms</span>
            <span className="hidden sm:inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">PLATFORM</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/home" className="text-xs sm:text-sm font-semibold text-[#111111] hover:text-[#F54E00] transition-colors duration-150">Home</Link>
            <Link href="/docs" className="hidden sm:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">Docs</Link>
            <Link href="/live-runs" className="hidden md:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">Status</Link>
            <Link href="https://github.com" className="hidden md:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">GitHub</Link>
            <button className="px-3 sm:px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors duration-150">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Platform Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black overflow-hidden">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl animate-slide-up">
            <div className="mb-4">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-600 inline-block animate-fade-in px-3 py-1 bg-gray-200 rounded-full">AUTONOMOUS AI CONTROL PLANE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mb-4 sm:mb-6 leading-tight animate-slide-up hover:text-[#F54E00] transition-colors duration-500" style={{ animationDelay: '0.1s' }}>
              Orchestrate Intelligent Systems at Runtime
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              OpenRooms is an infrastructure layer for coordinating AI agents, workflows, tools and execution environments across models, APIs and chains.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/control-plane" className="px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 inline-flex items-center justify-center gap-2">
              <span>Launch Control Plane</span>
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
            <Link href="/live-runs" className="px-6 py-3 bg-white border-2 border-black hover:bg-[#F54E00] hover:border-[#F54E00] text-[#111111] hover:text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 text-center">
              View Live System
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Platform Status Strip */}
      <div className="border-b border-[#D4C4A8] bg-[#E8DCC8] py-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-[#F54E00]">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-2 group">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-[#111111]">System Status:</span>
                <span className="text-sm font-semibold text-green-600 transition-all duration-200 group-hover:scale-110">Operational</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Rooms Active:</span>
                <span className="text-sm font-bold text-[#111111]">12</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Agents Running:</span>
                <span className="text-sm font-bold text-[#111111]">38</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Workflows Deployed:</span>
                <span className="text-sm font-bold text-[#111111]">16</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Events (24h):</span>
                <span className="text-sm font-bold text-[#111111]">4,382</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Modules Section */}
      <div className="py-12">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-3xl font-bold text-[#111111] mb-2">Platform Modules</h2>
            <p className="text-base text-gray-700">Build, deploy, execute and observe autonomous systems.</p>
          </div>

          {/* Main 3x3 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8">
            {apps.map((app, index) => {
              const Icon = app.icon
              const moduleId = app.id === 'live-runs' ? 'logs' : app.id
              return (
                <div 
                  key={app.id} 
                  className="module-card border-2 border-[#D4C4A8] rounded-2xl overflow-hidden group cursor-pointer"
                  data-module={moduleId}
                  style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                >
                  <div className="module-header px-4 py-3 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none" 
                         style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
                    <div className="flex items-center gap-2 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      <span className="text-[10px] font-semibold text-white tracking-wide">{app.category}</span>
                    </div>
                  </div>
                  <div className="bg-[#F5F1E8] group-hover:bg-white transition-colors duration-200 p-5 sm:p-6">
                    <div className="mb-4 transition-transform duration-150">
                      <Icon className="w-12 h-12 sm:w-14 sm:h-14" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-2">{app.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">{app.description}</p>
                    <Link href={app.href} className="inline-flex items-center gap-1 text-sm font-bold text-[#F54E00] hover:text-[#E24600] transition-colors duration-150">
                      <span>Open</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Category Groups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryGroups.map((group, index) => {
              const Icon = group.icon
              return (
                <div 
                  key={group.title} 
                  className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F54E00] group animate-slide-up"
                  style={{ animationDelay: `${1.1 + index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-12 h-12" />
                  </div>
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-[#F54E00] text-white text-sm font-bold rounded-lg mb-4 transition-all duration-200 group-hover:bg-[#E24600] group-hover:scale-105 group-hover:shadow-lg">
                    {group.title}
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div key={item} className="text-xs text-gray-700 font-medium transition-all duration-200 hover:text-[#F54E00] hover:scale-105">{item}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Powered By Section */}
      <div className="py-12 border-t border-[#D4C4A8] animate-fade-in" style={{ animationDelay: '1.4s' }}>
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <h3 className="text-2xl font-bold text-[#111111] mb-6">Powered by</h3>
          <div className="flex flex-wrap gap-3">
            {poweredByFeatures.map((feature, index) => (
              <div 
                key={feature} 
                className="px-4 py-2 bg-[#F5F1E8] border border-[#D4C4A8] rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:border-[#F54E00] hover:text-[#F54E00] hover:scale-105 transition-all duration-200 hover:shadow-md cursor-default animate-scale-in"
                style={{ animationDelay: `${1.5 + index * 0.05}s` }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Platform Activity */}
      <div className="py-12 border-t border-[#D4C4A8] animate-slide-up" style={{ animationDelay: '1.8s' }}>
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <h3 className="text-2xl font-bold text-[#111111] mb-6">Live Platform Activity</h3>
          <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-6 font-mono hover:shadow-lg transition-all duration-300 hover:border-[#F54E00]">
            <div className="space-y-2">
              {liveActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="text-sm text-gray-700 hover:bg-white transition-all duration-200 px-3 py-2 rounded hover:scale-[1.02] hover:shadow-sm animate-fade-in"
                  style={{ animationDelay: `${1.9 + index * 0.1}s` }}
                >
                  <span className="text-[#F54E00] font-bold animate-pulse">[{activity.time}]</span>{' '}
                  <span className="hover:text-[#111111] transition-colors duration-200">{activity.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up px-4" style={{ animationDelay: '2.3s' }}>
        <div className="bg-white/95 backdrop-blur-md border-2 border-black rounded-2xl px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,78,0,1)] transition-all duration-500 hover:scale-105 overflow-x-auto">
          {apps.map((app, index) => {
            const Icon = app.icon
            return (
              <Link 
                key={app.id} 
                href={app.href} 
                className="group relative flex-shrink-0 animate-bounce-in"
                style={{ animationDelay: `${2.4 + index * 0.05}s` }}
              >
                <div className="transition-all duration-500 cursor-pointer hover:scale-150 hover:-translate-y-3 active:scale-90 hover:rotate-12 hover:animate-wiggle">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#F54E00] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none group-hover:-translate-y-2 shadow-xl animate-pop">
                  {app.name}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#F54E00] rotate-45" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
