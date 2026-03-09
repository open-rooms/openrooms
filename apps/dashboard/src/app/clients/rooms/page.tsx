import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, StepList, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Rooms"
      description="Rooms are isolated execution environments where agents, workflows, tools, and knowledge operate together toward a goal. Every Room is scoped, persistent, and observable in real time."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Create a Room"
      actionHref="/rooms/new"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Isolation', value: 'Per Room', sub: 'Scoped agents & memory' },
            { label: 'Persistence', value: 'Always On', sub: 'Survives across sessions' },
            { label: 'Visibility', value: 'Real-time', sub: 'Live execution feed' },
          ]}
        />
        <StepList
          accentColor="#FDA4AF"
          steps={[
            { step: '1', title: 'Create a Room', body: 'Define a name, goal, and optional tags. The Room becomes your agent workspace.' },
            { step: '2', title: 'Add Agents', body: 'Assign autonomous agents to the Room. Each agent has its own goal, tools, and LLM config.' },
            { step: '3', title: 'Connect Workflows', body: 'Attach multi-step orchestration pipelines that coordinate agent execution.' },
            { step: '4', title: 'Observe in Real Time', body: 'Monitor every action, tool call, and decision as it happens inside the Room.' },
          ]}
        />
        <InfoCard
          heading="What is a Room?"
          body={`A Room is the fundamental unit of execution on OpenRooms. Think of it as a dedicated workspace for an autonomous system.\n\nRooms contain agents, workflows, knowledge, tools, and automation triggers — all operating together toward a shared goal. Every Room is isolated from others, ensuring no cross-contamination of state, memory, or execution.`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Create a Room', href: '/rooms/new', primary: true },
            { label: 'Browse Rooms', href: '/rooms' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
