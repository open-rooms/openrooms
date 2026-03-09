import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Automation"
      description="Set up triggers that launch workflows and agents automatically. Connect schedules, webhooks, external events, and API calls to drive autonomous execution without manual intervention."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Create Automation"
      actionHref="/automation"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Trigger Types', value: '4', sub: 'Cron / Webhook / Event / API' },
            { label: 'Execution', value: 'Instant', sub: 'Sub-second trigger latency' },
            { label: 'Reliability', value: '99.9%', sub: 'With auto-retry on failure' },
          ]}
        />
        <CapabilityGrid
          accentColor="#FDA4AF"
          items={[
            { title: 'Cron Schedules', desc: 'Run agents and workflows on any cron schedule. Daily reports, hourly scans, weekly summaries.' },
            { title: 'Webhooks', desc: 'Accept incoming HTTP events and use them to trigger workflow runs with the payload as input.' },
            { title: 'Event Bus', desc: 'Subscribe to internal platform events — agent completions, Room updates, or data changes.' },
            { title: 'API Trigger', desc: 'Call a secure endpoint to launch any workflow programmatically from your own application.' },
            { title: 'Conditional Logic', desc: 'Add conditions to triggers — only run if certain criteria are met in the payload or Room state.' },
            { title: 'Trigger History', desc: 'Every automation trigger is logged with its status, input data, and resulting workflow run.' },
          ]}
        />
        <InfoCard
          heading="How Automation Works"
          body={`Automation is the bridge between external events and your agent infrastructure.\n\nWhen a trigger fires — a webhook, a schedule, or an event — OpenRooms instantly queues the target workflow and routes the trigger payload as the initial context. The workflow picks it up, runs through each step, and logs results back to the Room.\n\nNo polling. No glue code. Just define the trigger and it runs.`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Create Automation', href: '/automation', primary: true },
            { label: 'View Trigger Logs', href: '/clients/live-activity' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
