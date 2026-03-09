'use client'

import { SubPageShell } from '@/components/SubPageShell'
import { InfoCard, ActionRow } from '@/components/PageContent'

const ARCHITECTURE = `
OpenRooms Control Plane
═══════════════════════════════════════════════════════════

  CLIENT LAYER
  ┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────┐
  │  Rooms  │  │ Agents  │  │  Workflows   │  │  Tools  │
  └────┬────┘  └────┬────┘  └──────┬───────┘  └────┬────┘
       │             │              │                │
       └─────────────┴──────────────┴────────────────┘
                              │
  ORCHESTRATION LAYER         │
  ┌───────────────────────────▼──────────────────────────┐
  │              Event Bus  /  Job Queue                 │
  │  Automation Triggers  →  Priority Scheduler          │
  └───────────────────────────┬──────────────────────────┘
                              │
  EXECUTION LAYER             │
  ┌───────────────────────────▼──────────────────────────┐
  │   Worker Pool  (Node 1 .. N)   ←  Auto-Scaling       │
  │   BullMQ  |  Redis  |  Retry  |  Dead Letter Queue   │
  └───────────────────────────┬──────────────────────────┘
                              │
  MEMORY + KNOWLEDGE          │
  ┌───────────────────────────▼──────────────────────────┐
  │        Agent Memory Graph  /  Knowledge Store        │
  │     Per Room  |  Persistent  |  All-Agent Access     │
  └───────────────────────────┬──────────────────────────┘
                              │
  OBSERVABILITY LAYER         │
  ┌───────────────────────────▼──────────────────────────┐
  │  Logs  |  Traces  |  Metrics  |  Audit  |  Alerts   │
  │  OpenTelemetry Export  →  Grafana / Datadog / SIEM   │
  └──────────────────────────────────────────────────────┘
`

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Architecture"
      description="Visual system architecture of the OpenRooms infrastructure deployment. Understand how every layer connects — from client interfaces to execution workers to observability pipelines."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="View System Map"
      actionHref="/system"
    >
      <div className="space-y-6">
        <div className="bg-[#111111] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-black border-b border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span className="ml-2 text-[11px] text-gray-500 font-mono">openrooms — system architecture</span>
          </div>
          <pre className="text-xs text-[#86EFAC] font-mono overflow-x-auto leading-relaxed p-5 whitespace-pre">
            {ARCHITECTURE}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            variant="light"
            heading="Client Layer"
            body={"Rooms, Agents, Workflows, and Tools are the top-level abstractions clients interact with. These map to the API surface and dashboard interfaces used by the Clients, Developers, and Enterprise paths."}
          />
          <InfoCard
            variant="light"
            heading="Orchestration Layer"
            body={"The Event Bus and Job Queue decouple trigger events from execution. Automation rules fire into the scheduler, which prioritizes and dispatches jobs to worker nodes."}
          />
          <InfoCard
            variant="light"
            heading="Execution Layer"
            body={"Worker pools process agent runs and workflow steps using BullMQ over Redis. Workers auto-scale based on queue pressure and support retry policies and dead letter queues."}
          />
          <InfoCard
            variant="light"
            heading="Observability Layer"
            body={"Logs, traces, metrics, and audit data from every layer are collected and available via the dashboard, exported to OpenTelemetry, and queryable via the API."}
          />
        </div>

        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'View System Map', href: '/system', primary: true },
            { label: 'Control Plane Docs', href: '/docs' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
